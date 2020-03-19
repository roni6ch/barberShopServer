import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.model';
import { ObjectID } from 'mongodb';

@Injectable()
export class CustomersService {
  constructor(@InjectModel('Customer') private readonly cm: Model<Customer>) {}
  
  async deleteAllDocuments() {
    return await this.cm.deleteMany();
  }

  async getMyTreatments(id: string): Promise<boolean | PromiseLike<boolean>> {
    const result = await this.cm.find({ id });
    return result;
  }

  async addTreatment(customer) {
    const newTreatment = new this.cm(customer);
    const result = await newTreatment.save();
    return result;
  }

  async deleteTreatment(data: Customer) {
    return await this.cm.deleteOne({_id: data['_id']}).exec();
  }
}
