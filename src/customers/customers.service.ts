import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.model';
import { Logger } from 'winston';
import * as moment from 'moment';

@Injectable()
export class CustomersService {
  constructor(@InjectModel('Customer') private readonly cm: Model<Customer>, @Inject('winston') private readonly logger: Logger) {}
  
  async deleteOldDocuments(oldMonth){
    try {
      let res = await this.cm.deleteMany({"date" : { $lt : oldMonth }});
      if (res) return res;
      else {
        this.log('error','CustomersService -> delete() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomersService -> deleteOldDocuments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
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
    customer.host = req.body.host;
    customer.username = req.body.username;
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


  async userTreatments(req) {
    let host = req.body.host;
    let username = req.body.username;
    try {
      let res = await this.cm.find({host,username,date: { $gte:+moment().subtract(0,'days').endOf('day')} }).exec();
      if (res) return res;
      else {
        this.log('error','CustomersService -> userTreatments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomersService -> userTreatments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async userTreatmentsOld(req) {
    let host = req.body.host;
    let username = req.body.username;
    try {
      let res = await this.cm.find({host,username,date: { $lte:+moment().subtract(0,'days').endOf('day')} }).exec();
      if (res) return res;
      else {
        this.log('error','CustomersService -> userTreatments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error',`CustomersService -> userTreatments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  
  

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
