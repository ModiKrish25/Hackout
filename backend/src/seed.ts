import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { FacilitiesService } from './facilities/facilities.service';
import { WasteListingsService } from './waste-listings/waste-listings.service';
import { MatchesService } from './matches/matches.service';
import { UserRole } from './common/enums/user-role.enum';
import { WasteType } from './common/enums/waste-type.enum';
import { FacilityType } from './common/enums/facility-type.enum';
import { User } from './users/entities/user.entity';
import { DataSource } from 'typeorm';

async function bootstrap() {
    console.log('====================================================');
    console.log('🌱 Starting Waste-to-Carbon Seed Script...');
    console.log('====================================================');

    const app = await NestFactory.createApplicationContext(AppModule);

    const dataSource = app.get(DataSource);
    const usersService = app.get(UsersService);
    const facilitiesService = app.get(FacilitiesService);
    const wasteListingsService = app.get(WasteListingsService);
    const matchesService = app.get(MatchesService);

    console.log('\n--- 1. Seeding 6 Generator Users in Bangalore ---');
    const generatorData = [
        {
            name: 'Green Harvest Organic Farm',
            email: 'greenharvest@example.com',
            password: 'Password123!',
            phone: '+91 98765 43210',
            state: 'Karnataka',
            city: 'Bengaluru',
            role: UserRole.GENERATOR,
            locationLat: 13.0645,
            locationLng: 77.5852, // Yelahanka
        },
        {
            name: 'Bangalore Dairy Agro Cooperative',
            email: 'bengaluru.dairy@example.com',
            password: 'Password123!',
            phone: '+91 98765 43211',
            state: 'Karnataka',
            city: 'Bengaluru',
            role: UserRole.GENERATOR,
            locationLat: 12.9234,
            locationLng: 77.5342, // Rajarajeshwari Nagar
        },
        {
            name: 'Metro Food Processors Ltd',
            email: 'metrofoods@example.com',
            password: 'Password123!',
            phone: '+91 98765 43212',
            state: 'Karnataka',
            city: 'Bengaluru',
            role: UserRole.GENERATOR,
            locationLat: 12.9812,
            locationLng: 77.6415, // Indiranagar
        },
        {
            name: 'FreshFields Produce Market',
            email: 'freshfields@example.com',
            password: 'Password123!',
            phone: '+91 98765 43213',
            state: 'Karnataka',
            city: 'Bengaluru',
            role: UserRole.GENERATOR,
            locationLat: 12.9348,
            locationLng: 77.6189, // Koramangala
        },
        {
            name: 'Apex Brewery & Beverages',
            email: 'apexbrewery@example.com',
            password: 'Password123!',
            phone: '+91 98765 43214',
            state: 'Karnataka',
            city: 'Bengaluru',
            role: UserRole.GENERATOR,
            locationLat: 12.9716,
            locationLng: 77.7500, // Whitefield
        },
        {
            name: 'BioAgri Crop Solutions',
            email: 'bioagri@example.com',
            password: 'Password123!',
            phone: '+91 98765 43215',
            state: 'Karnataka',
            city: 'Bengaluru',
            role: UserRole.GENERATOR,
            locationLat: 12.8452,
            locationLng: 77.6602, // Electronic City
        },
    ];

    const seededGenerators: User[] = [];
    for (const g of generatorData) {
        let user = await usersService.findByEmail(g.email);
        if (!user) {
            user = await usersService.create(g);
            console.log(` Created Generator: ${g.name} (${g.email})`);
        } else {
            console.log(` Generator already exists: ${g.name}`);
        }
        seededGenerators.push(user);
    }

    console.log('\n--- 2. Seeding 4 Facility Operators & Facilities in Bangalore ---');
    const facilityData = [
        {
            user: {
                name: 'CleanBio Energy Solutions',
                email: 'cleanbio@example.com',
                password: 'Password123!',
                phone: '+91 98765 43220',
                state: 'Karnataka',
                city: 'Bengaluru',
                role: UserRole.FACILITY,
                locationLat: 13.0285,
                locationLng: 77.5197, // Peenya Industrial Area
            },
            facility: {
                facilityType: FacilityType.BIOGAS,
                acceptedWasteTypes: [WasteType.FOOD, WasteType.MANURE],
                capacityTonsPerWeek: 300.0,
                currentUtilization: 0.0,
                locationLat: 13.0285,
                locationLng: 77.5197,
            },
        },
        {
            user: {
                name: 'East Green Gas Utilities',
                email: 'eastgreengas@example.com',
                password: 'Password123!',
                phone: '+91 98765 43221',
                state: 'Karnataka',
                city: 'Bengaluru',
                role: UserRole.FACILITY,
                locationLat: 12.9698,
                locationLng: 77.7200, // Mahadevapura
            },
            facility: {
                facilityType: FacilityType.BIOGAS,
                acceptedWasteTypes: [WasteType.FOOD, WasteType.INDUSTRIAL_ORGANIC],
                capacityTonsPerWeek: 250.0,
                currentUtilization: 0.0,
                locationLat: 12.9698,
                locationLng: 77.7200,
            },
        },
        {
            user: {
                name: 'BioCarbon PyroTech Systems',
                email: 'pyrotech@example.com',
                password: 'Password123!',
                phone: '+91 98765 43222',
                state: 'Karnataka',
                city: 'Bengaluru',
                role: UserRole.FACILITY,
                locationLat: 12.8752,
                locationLng: 77.6200, // Bommasandra
            },
            facility: {
                facilityType: FacilityType.BIOCHAR,
                acceptedWasteTypes: [WasteType.AGRICULTURAL, WasteType.INDUSTRIAL_ORGANIC],
                capacityTonsPerWeek: 180.0,
                currentUtilization: 0.0,
                locationLat: 12.8752,
                locationLng: 77.6200,
            },
        },
        {
            user: {
                name: 'City Compost & Soil Enrichment',
                email: 'citycompost@example.com',
                password: 'Password123!',
                phone: '+91 98765 43223',
                state: 'Karnataka',
                city: 'Bengaluru',
                role: UserRole.FACILITY,
                locationLat: 13.0012,
                locationLng: 77.5689, // Malleshwaram
            },
            facility: {
                facilityType: FacilityType.COMPOSTING,
                acceptedWasteTypes: [WasteType.FOOD, WasteType.AGRICULTURAL, WasteType.MANURE],
                capacityTonsPerWeek: 400.0,
                currentUtilization: 0.0,
                locationLat: 13.0012,
                locationLng: 77.5689,
            },
        },
    ];

    const seededFacilities = [];
    for (const item of facilityData) {
        let opUser = await usersService.findByEmail(item.user.email);
        if (!opUser) {
            opUser = await usersService.create(item.user);
            console.log(` Created Facility Operator: ${item.user.name}`);
        }
        
        // Check if facility exists
        const existingFacilities = await facilitiesService.findAll({});
        let fac = existingFacilities.find((f) => f.operatorId === opUser.id);
        if (!fac) {
            fac = await facilitiesService.create(opUser.id, item.facility);
            console.log(` Created Facility: ${item.user.name} (${item.facility.facilityType}) -> Capacity: ${item.facility.capacityTonsPerWeek} T/week`);
        } else {
            console.log(` Facility already exists: ${item.user.name}`);
        }
        seededFacilities.push({ operator: opUser, facility: fac });
    }

    console.log('\n--- 3. Seeding 9 Waste Listings across Generators ---');
    const now = new Date();
    const listingSpecs = [
        {
            genIndex: 0, // Green Harvest
            wasteType: WasteType.AGRICULTURAL,
            quantityTons: 15.0,
            moistureContent: 40.0,
            daysAvailable: 5,
        },
        {
            genIndex: 0, // Green Harvest
            wasteType: WasteType.MANURE,
            quantityTons: 25.0,
            moistureContent: 65.0,
            daysAvailable: 4,
        },
        {
            genIndex: 1, // Bangalore Dairy
            wasteType: WasteType.MANURE,
            quantityTons: 35.0,
            moistureContent: 75.0,
            daysAvailable: 7,
        },
        {
            genIndex: 2, // Metro Food Processors
            wasteType: WasteType.FOOD,
            quantityTons: 12.5,
            moistureContent: 70.0,
            daysAvailable: 3,
        },
        {
            genIndex: 2, // Metro Food Processors
            wasteType: WasteType.FOOD,
            quantityTons: 8.0,
            moistureContent: 60.0,
            daysAvailable: 4,
        },
        {
            genIndex: 3, // FreshFields Produce Market
            wasteType: WasteType.FOOD,
            quantityTons: 18.0,
            moistureContent: 65.0,
            daysAvailable: 5,
        },
        {
            genIndex: 4, // Apex Brewery
            wasteType: WasteType.INDUSTRIAL_ORGANIC,
            quantityTons: 20.0,
            moistureContent: 30.0,
            daysAvailable: 6,
        },
        {
            genIndex: 4, // Apex Brewery
            wasteType: WasteType.INDUSTRIAL_ORGANIC,
            quantityTons: 14.0,
            moistureContent: 35.0,
            daysAvailable: 5,
        },
        {
            genIndex: 5, // BioAgri Crop Solutions
            wasteType: WasteType.AGRICULTURAL,
            quantityTons: 22.0,
            moistureContent: 45.0,
            daysAvailable: 8,
        },
    ];

    const seededListings = [];
    for (let i = 0; i < listingSpecs.length; i++) {
        const spec = listingSpecs[i];
        const gen = seededGenerators[spec.genIndex];
        const availableFrom = new Date(now.getTime() + 1000 * 60 * 60 * 2);
        const availableTo = new Date(now.getTime() + 1000 * 60 * 60 * 24 * spec.daysAvailable);

        const listing = await wasteListingsService.create(gen.id, {
            wasteType: spec.wasteType,
            quantityTons: spec.quantityTons,
            moistureContent: spec.moistureContent,
            locationLat: Number(gen.locationLat),
            locationLng: Number(gen.locationLng),
            availableFrom: availableFrom.toISOString(),
            availableTo: availableTo.toISOString(),
        });

        console.log(` Created Listing #${listing.id}: ${gen.name} -> ${spec.quantityTons}T ${spec.wasteType}`);
        seededListings.push(listing);
    }

    console.log('\n--- 4. Triggering Matching Engine & Workflows ---');
    // Match 5 listings to compatible facilities
    const createdMatches = [];
    for (let i = 0; i < 5; i++) {
        const listing = seededListings[i];
        const candidates = await matchesService.findCandidates(listing.id);
        if (candidates.length > 0) {
            const bestCandidate = candidates[0];
            const match = await matchesService.create({
                listingId: listing.id,
                facilityId: bestCandidate.facilityId,
                matchedQuantityTons: Number(listing.quantityTons),
                matchScore: bestCandidate.score,
            });
            console.log(` Created Match #${match.id}: Listing #${listing.id} matched to Facility #${bestCandidate.facilityId} (Score: ${bestCandidate.score})`);
            createdMatches.push(match);
        }
    }

    console.log('\n--- 5. Confirming 3 Matches ---');
    for (let i = 0; i < 3 && i < createdMatches.length; i++) {
        const m = createdMatches[i];
        const targetFac = seededFacilities.find((sf) => sf.facility.id === m.facilityId);
        if (targetFac) {
            const confirmed = await matchesService.confirm(m.id, targetFac.operator);
            console.log(` Confirmed Match #${confirmed.id} -> Status: ${confirmed.status}`);
        }
    }

    console.log('\n--- 6. Processing 1 Match All The Way Through ---');
    if (createdMatches.length > 0) {
        const processedTarget = createdMatches[0];
        const targetFac = seededFacilities.find((sf) => sf.facility.id === processedTarget.facilityId);
        if (targetFac) {
            const processResult = await matchesService.process(processedTarget.id, targetFac.operator);
            console.log(` Processed Match #${processResult.match.id} -> Auto-created CarbonRecord #${processResult.carbonRecord.id}:`);
            console.log(`   * CO2 Sequestered: ${processResult.carbonRecord.co2SequesteredTons} T`);
            console.log(`   * Landfill Baseline Avoided: ${processResult.carbonRecord.landfillBaselineEmissionsTons} T`);
            console.log(`   * Net Carbon Benefit: ${processResult.carbonRecord.netCarbonBenefitTons} T`);
        }
    }

    console.log('\n====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');

    await app.close();
    process.exit(0);
}

bootstrap().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
