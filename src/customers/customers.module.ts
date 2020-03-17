import { DataService } from 'src/data/data.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { CustomerSchema } from './customer.model';
import { CustomerController } from './customer.controller';
import { CustomersService } from './customers.service';
import { DataSchema } from 'src/data/data.model';

@Module({
  imports: [
    MongooseModule.forFeature([{name:'Customer',schema:CustomerSchema}]),
    MongooseModule.forFeature([{name:'Data',schema:DataSchema}])
 ],
  controllers: [CustomerController],
  providers: [CustomersService,DataService],
})
export class CustomersModule {}
