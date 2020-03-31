import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.model';
import { Logger } from 'winston';

@Injectable()
export class CustomersService {
  constructor(@InjectModel('Customer') private readonly cm: Model<Customer>, @Inject('winston') private readonly logger: Logger) {}
  
  async deleteAllDocuments() {
    try {
      let res = await this.cm.deleteMany();
      if (res) return res;
      else {
        this.log('error','CustomersService -> deleteAllDocuments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomersService -> deleteAllDocuments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async addTreatment(customer,req) {
    let host = req.body.host;
    customer.host = host;
    const newTreatment = new this.cm(customer);
    try {
      let res = await newTreatment.save();
      if (res) return res;
      else {
        this.log('error','CustomersService -> save() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomersService -> save() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async deleteTreatment(data: Customer,req) {
    let host = req.body.host;
    try {
      let res = await this.cm.deleteOne({_id: data['_id'],host}).exec();
      if (res.n > 0) return data;
      else {
        this.log('error','CustomersService -> deleteOne() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomersService -> deleteOne() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
