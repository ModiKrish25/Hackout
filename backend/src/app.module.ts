import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WasteListingsModule } from './waste-listings/waste-listings.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { MatchesModule } from './matches/matches.module';
import { RoutesModule } from './routes/routes.module';
import { CarbonRecordsModule } from './carbon-records/carbon-records.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<number>('DB_PORT', 3306)),
        username: configService.get<string>('DB_USER', 'root'),
        password: configService.get<string>('DB_PASSWORD') ?? configService.get<string>('DB_PASS', ''),
        database: configService.get<string>('DB_NAME', 'waste_to_carbon_db'),
        autoLoadEntities: true,
        synchronize: true, // Hackathon setting
      }),
    }),
    AuthModule,
    UsersModule,
    WasteListingsModule,
    FacilitiesModule,
    MatchesModule,
    RoutesModule,
    CarbonRecordsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
