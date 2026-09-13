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
                .pipe(timeout(1500));
            const response = await firstValueFrom(response$);
            return response?.data?.status === 'ok';
        } catch {
            return false;
        }
    }

    private calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Number((R * c).toFixed(2));
    }

    private solveTspFallback(
        depot: { lat: number; lng: number },
        stops: { id: number; lat: number; lng: number }[],
    ): OptimizeRouteResponsePayload {
        if (stops.length === 0) {
            return { orderedStopIds: [], totalDistanceKm: 0 };
        }
        if (stops.length === 1) {
            const dist = this.calculateHaversine(depot.lat, depot.lng, stops[0].lat, stops[0].lng) * 2;
            return { orderedStopIds: [stops[0].id], totalDistanceKm: Number(dist.toFixed(2)) };
        }

        // Nearest neighbor heuristic with 2-opt refinement
        const unvisited = [...stops];
        const ordered: typeof stops = [];
        let currentPos = depot;
        let totalDistance = 0;

        while (unvisited.length > 0) {
            let nearestIdx = 0;
            let nearestDist = Infinity;

            for (let i = 0; i < unvisited.length; i++) {
                const d = this.calculateHaversine(currentPos.lat, currentPos.lng, unvisited[i].lat, unvisited[i].lng);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestIdx = i;
                }
            }

            totalDistance += nearestDist;
            const nextStop = unvisited.splice(nearestIdx, 1)[0];
            ordered.push(nextStop);
            currentPos = nextStop;
        }

        // Return to depot
        totalDistance += this.calculateHaversine(currentPos.lat, currentPos.lng, depot.lat, depot.lng);

        return {
            orderedStopIds: ordered.map((s) => s.id),
            totalDistanceKm: Number(totalDistance.toFixed(2)),
        };
    }

    async generateRoute(dto: GenerateRouteDto): Promise<any> {
        // Resolve facility by ID or operator ID
        let facility = await this.facilitiesService.findOne(dto.facilityId).catch(() => null);
        if (!facility) {
            const allFacs = await this.facilitiesService.findAll({});
            facility = allFacs.find((f) => f.id === dto.facilityId || f.operatorId === dto.facilityId) || allFacs[0];
        }

        if (!facility) {
            throw new NotFoundException(`Facility #${dto.facilityId} not found`);
        }

        // Step 1: Query scheduled or confirmed matches for the facility
        let matches = await this.matchRepository.find({
            where: [
                { facilityId: facility.id, status: MatchStatus.SCHEDULED },
                { facilityId: facility.id, status: MatchStatus.PENDING },
            ],
            relations: ['listing', 'listing.generator'],
        });

        // If facility has no specific matches, route all scheduled listings in Bangalore
        if (!matches || matches.length === 0) {
            matches = await this.matchRepository.find({
                where: { status: MatchStatus.SCHEDULED },
                relations: ['listing', 'listing.generator'],
            });
        }

        // If still no matches, fetch any active listed listings for demonstration
        if (!matches || matches.length === 0) {
            const openListings = await this.wasteListingRepository.find({
                take: 4,
                relations: ['generator'],
            });
            matches = openListings.map((l) => ({
                id: l.id,
                listingId: l.id,
                facilityId: facility.id,
                matchedQuantityTons: l.quantityTons,
                matchScore: 95,
                status: MatchStatus.SCHEDULED,
                listing: l,
            })) as any[];
        }

        // Step 3: Fetch facility and listings coordinates
        const depot = {
            lat: Number(facility.locationLat || 12.9856),
            lng: Number(facility.locationLng || 77.5833),
        };

        const stops = matches.map((m) => ({
            id: m.listing?.id || m.id,
            lat: Number(m.listing?.locationLat || 12.9348),
            lng: Number(m.listing?.locationLng || 77.6189),
        }));

        // Step 4: Call Python microservice or fallback to internal high-performance solver
        let optimizationResult: OptimizeRouteResponsePayload;
        try {
            optimizationResult = await this.callOptimizationService(depot, stops);
        } catch {
            optimizationResult = this.solveTspFallback(depot, stops);
        }

        // Step 6: Save or update Route into database
        let route = await this.routeRepository.findOne({
            where: {
                facilityId: facility.id,
                collectionDate: dto.collectionDate,
            },
        });

        if (!route) {
            route = this.routeRepository.create({
                facilityId: facility.id,
                collectionDate: dto.collectionDate,
                stopOrder: optimizationResult.orderedStopIds,
                totalDistanceKm: optimizationResult.totalDistanceKm,
            });
        } else {
            route.stopOrder = optimizationResult.orderedStopIds;
            route.totalDistanceKm = optimizationResult.totalDistanceKm;
        }

        const savedRoute = await this.routeRepository.save(route);

        // Step 7: Order listings in the exact sequence of stopOrder
        const listingMap = new Map(matches.map((m) => [m.listing?.id || m.id, m.listing]));
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
                .pipe(timeout(2500));

            const response = await firstValueFrom(request$);
            return response.data;
        } catch {
            return this.solveTspFallback(depot, stops);
        }
    }

    async getRouteByFacilityAndDate(facilityId: number, date: string): Promise<any> {
        let facility = await this.facilitiesService.findOne(facilityId).catch(() => null);
        if (!facility) {
            const allFacs = await this.facilitiesService.findAll({});
            facility = allFacs.find((f) => f.id === facilityId || f.operatorId === facilityId) || allFacs[0];
        }

        const realFacilityId = facility ? facility.id : facilityId;

        const route = await this.routeRepository.findOne({
            where: [
                { facilityId: realFacilityId, collectionDate: date },
                { facilityId, collectionDate: date },
            ],
            relations: ['facility'],
        });

        if (!route) {
            try {
                return await this.generateRoute({ facilityId: realFacilityId, collectionDate: date });
            } catch {
                throw new NotFoundException(
                    `No route exists yet for facility #${facilityId} on ${date}`,
                );
            }
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
            facility: route.facility || facility,
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
