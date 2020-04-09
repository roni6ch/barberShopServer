import { CustomersService } from './../customers/customers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DataController } from './data.controller';
import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataSchema } from './data.model';
import { CustomerSchema } from 'src/customers/customer.model';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [
    SettingsModule,
    MongooseModule.forFeature([{name:'Data',schema:DataSchema}]),
    MongooseModule.forFeature([{name:'Customer',schema:CustomerSchema}])
 ],
  controllers: [DataController],
  providers: [DataService,CustomersService]
})
export class DataModule {}
