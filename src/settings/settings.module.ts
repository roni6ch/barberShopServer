import { DataController } from './../data/data.controller';
import { CustomerSchema } from 'src/customers/customer.model';
import { CustomerController } from './../customers/customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { SettingsSchema } from './settings.model';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { CustomersService } from 'src/customers/customers.service';
import { DataSchema } from 'src/data/data.model';
import { DataService } from 'src/data/data.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name:'Customer',schema:CustomerSchema}]),
    MongooseModule.forFeature([{name:'Settings',schema:SettingsSchema}]),
    MongooseModule.forFeature([{name:'Data',schema:DataSchema}]),
 ],
  controllers: [SettingsController,CustomerController,DataController],
  providers: [SettingsService,CustomersService,DataService]
})
export class SettingsModule {}
