import { CustomersService } from './customers/customers.service';
import { DataController } from './data/data.controller';
import { AdminController } from './admin/admin.controller';
import { HttpMiddleware } from './http.middleware';
import { AuthModule } from './auth/auth.module';
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { constants } from './constants';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersModule } from './customers/customers.module';
import { SettingsController } from './settings/settings.controller';
import { AdminModule } from './admin/admin.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { CustomerController } from './customers/customer.controller';
import { SettingsModule } from './settings/settings.module';
import { SettingsService } from './settings/settings.service';
import { MulterModule } from '@nestjs/platform-express';
import { LPModule } from './lp/lp.module';

@Module({
  imports: [
    DataModule,
    CustomersModule,
    AuthModule,
    AdminModule,
    SettingsModule,
    LPModule,
    MulterModule.register({
      dest: '/upload',
    }),
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
  controllers: [],
  providers: []
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpMiddleware)
      .forRoutes(AdminController,DataController,CustomerController);
  }
}
