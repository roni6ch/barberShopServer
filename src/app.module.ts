import { UsersModule } from './users/users.module';
import { SettingsService } from './settings/settings.service';
import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { constants } from './constants';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersModule } from './customers/customers.module';
import { SettingsController } from './settings/settings.controller';
import { AdminModule } from './admin/admin.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    DataModule,
    CustomersModule,
    UsersModule,
    AdminModule,
    WinstonModule.forRoot({
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    }),
    MongooseModule.forRoot(
      `mongodb+srv://${constants.mdbUser}:${constants.mdbPass}@cluster0-rmhe5.gcp.mongodb.net/${constants.collection}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    ),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class AppModule {}
