import { CustomersService } from './../customers/customers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DataController } from './data.controller';
import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataSchema } from './data.model';
import { SettingsService } from 'src/settings/settings.service';
import { SettingsSchema } from 'src/settings/settings.model';
import { CustomerSchema } from 'src/customers/customer.model';

@Module({
  imports: [
    MongooseModule.forFeature([{name:'Data',schema:DataSchema}]),
    MongooseModule.forFeature([{name:'Customer',schema:CustomerSchema}]),
    MongooseModule.forFeature([{name:'Settings',schema:SettingsSchema}]),
 ],
  controllers: [DataController],
  providers: [DataService,SettingsService,CustomersService]
})
export class DataModule {}
