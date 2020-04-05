
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UsersSchema } from './users.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SettingsService } from 'src/settings/settings.service';
import { SettingsSchema } from 'src/settings/settings.model';
import { CustomersService } from 'src/customers/customers.service';
import { CustomerSchema } from 'src/customers/customer.model';



@Module({
  imports: [
    MongooseModule.forFeature([{name:'Customer',schema:CustomerSchema}]),
    MongooseModule.forFeature([{name:'Settings',schema:SettingsSchema}]),
    MongooseModule.forFeature([{name:'Users',schema:UsersSchema}])
 ],
  controllers: [UsersController],
  providers: [UsersService,SettingsService,CustomersService]
})
export class UsersModule {} 
