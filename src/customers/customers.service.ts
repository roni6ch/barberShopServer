import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.model';

@Injectable()
export class CustomersService {
  constructor(@InjectModel('Customer') private readonly cm: Model<Customer>) {}

  async addData(customer){
    const newTreatment = new this.cm(customer);
    const result = await newTreatment.save();
    return result;
  }
}
