import { SettingsService } from './settings/settings.service';
import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { constants } from './constants';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersModule } from './customers/customers.module';
import { SettingsController } from './settings/settings.controller';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [
    DataModule,
    CustomersModule,
    AdminModule,
    MongooseModule.forRoot(`mongodb+srv://${constants.mdbUser}:${constants.mdbPass}@cluster0-rmhe5.gcp.mongodb.net/${constants.collection}?retryWrites=true&w=majority`, { useNewUrlParser: true,useUnifiedTopology:true,useFindAndModify: false}),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class AppModule {}
