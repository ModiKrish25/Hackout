import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ServiceUnavailableException,
    GatewayTimeoutException,
    BadGatewayException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { Route } from './entities/route.entity';
import { GenerateRouteDto } from './dto/generate-route.dto';
import { Match } from '../matches/entities/match.entity';
import { WasteListing } from '../waste-listings/entities/waste-listing.entity';
import { FacilitiesService } from '../facilities/facilities.service';
import { MatchStatus } from '../common/enums/match-status.enum';

export interface OptimizeRouteResponsePayload {
    orderedStopIds: number[];
    totalDistanceKm: number;
}

@Injectable()
export class RoutesService {
    private readonly logger = new Logger(RoutesService.name);
    private readonly pythonServiceUrl: string;

    constructor(
        @InjectRepository(Route)
        private readonly routeRepository: Repository<Route>,
        @InjectRepository(Match)
        private readonly matchRepository: Repository<Match>,
        @InjectRepository(WasteListing)
        private readonly wasteListingRepository: Repository<WasteListing>,
        private readonly facilitiesService: FacilitiesService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.pythonServiceUrl =
            this.configService.get<string>('PYTHON_ROUTE_SERVICE_URL') || 'http://localhost:8001';
    }

    async checkPythonHealth(): Promise<boolean> {
        try {
            const response$ = this.httpService
                .get(`${this.pythonServiceUrl}/health`)
                .pipe(timeout(3000));
            const response = await firstValueFrom(response$);
            return response?.data?.status === 'ok';
        } catch (error) {
            this.logger.warn(`Python route optimization health check failed: ${error.message}`);
            throw new ServiceUnavailableException(
                'Route optimization service is currently unavailable',
            );
        }
    }

    async generateRoute(dto: GenerateRouteDto): Promise<any> {
        // Step 1: Query scheduled matches for the facility
        const matches = await this.matchRepository.find({
            where: {
                facilityId: dto.facilityId,
                status: MatchStatus.SCHEDULED,
            },
            relations: ['listing', 'listing.generator'],
        });

        // Step 2: Validate scheduled matches exist
        if (!matches || matches.length === 0) {
            throw new BadRequestException('No scheduled matches to route');
        }

        // Step 3: Fetch facility and listings coordinates
        const facility = await this.facilitiesService.findOne(dto.facilityId);
        const depot = {
            lat: Number(facility.locationLat),
            lng: Number(facility.locationLng),
        };

        const stops = matches.map((m) => ({
            id: m.listing.id,
            lat: Number(m.listing.locationLat),
            lng: Number(m.listing.locationLng),
        }));

        // Step 4: Perform pre-flight health check
        await this.checkPythonHealth();

        // Step 5: Call Python microservice with 8-second timeout & error handling
        const optimizationResult = await this.callOptimizationService(depot, stops);

        // Step 6: Save Route into database
        const route = this.routeRepository.create({
            facilityId: dto.facilityId,
            collectionDate: dto.collectionDate,
            stopOrder: optimizationResult.orderedStopIds,
            totalDistanceKm: optimizationResult.totalDistanceKm,
        });

        const savedRoute = await this.routeRepository.save(route);

        // Step 7: Order listings in the exact sequence of stopOrder
        const listingMap = new Map(matches.map((m) => [m.listing.id, m.listing]));
        const orderedListings = optimizationResult.orderedStopIds
            .map((id) => listingMap.get(id))
            .filter(Boolean);

        return {
            ...savedRoute,
            facility,
            orderedListings,
        };
    }

    private async callOptimizationService(
        depot: { lat: number; lng: number },
        stops: { id: number; lat: number; lng: number }[],
    ): Promise<OptimizeRouteResponsePayload> {
        try {
            const request$ = this.httpService
                .post<OptimizeRouteResponsePayload>(
                    `${this.pythonServiceUrl}/optimize-route`,
                    { depot, stops },
                )
                .pipe(timeout(8000));

            const response = await firstValueFrom(request$);
            return response.data;
        } catch (error) {
            this.logger.error(`Error calling Python route optimizer: ${error.message}`, error.stack);

            if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
                throw new GatewayTimeoutException(
                    'Route optimization took too long, please try again',
                );
            }

            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new ServiceUnavailableException(
                    'Route optimization service is currently unavailable',
                );
            }

            if (error.response) {
                this.logger.error(
                    `Python service returned status ${error.response.status}: ${JSON.stringify(
                        error.response.data,
                    )}`,
                );
                throw new BadGatewayException('Route optimization failed');
            }

            throw new ServiceUnavailableException(
                'Route optimization service is currently unavailable',
            );
        }
    }

    async getRouteByFacilityAndDate(facilityId: number, date: string): Promise<any> {
        const route = await this.routeRepository.findOne({
            where: {
                facilityId,
                collectionDate: date,
            },
            relations: ['facility'],
        });

        if (!route) {
            throw new NotFoundException(
                `No route exists yet for facility #${facilityId} on ${date}`,
            );
        }

        let orderedListings: WasteListing[] = [];
        if (route.stopOrder && route.stopOrder.length > 0) {
            const listings = await this.wasteListingRepository.find({
                where: { id: In(route.stopOrder) },
                relations: ['generator'],
            });

            const listingMap = new Map(listings.map((l) => [l.id, l]));
            orderedListings = route.stopOrder
                .map((id) => listingMap.get(id))
                .filter(Boolean) as WasteListing[];
        }

        return {
            ...route,
            orderedListings,
        };
    }

    async findAll(): Promise<Route[]> {
        return this.routeRepository.find({ relations: ['facility'] });
    }

    async findOne(id: number): Promise<Route | null> {
        return this.routeRepository.findOne({ where: { id }, relations: ['facility'] });
    }
}
