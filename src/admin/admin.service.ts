import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Data } from 'src/data/data.model';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { Customer } from 'src/customers/customer.model';

@Injectable()
export class AdminService {
  constructor(@InjectModel('Customer') private readonly cm: Model<Customer>,@InjectModel('Data') private readonly dm: Model<Data>, @Inject('winston') private readonly logger: Logger) {}


  async getMyTreatments(): Promise<boolean | PromiseLike<boolean>> {
    try {
      let res = await this.cm.find();
      if (res) return res;
      else {
        this.log('error','AdminService -> getMyTreatments() in -> else res');
        throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      this.log('error',`AdminService -> getMyTreatments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async setAvailability(
    dayTimestamp: string,
    available: boolean,
  ): Promise<boolean> {
    const filter = { dayTimestamp };
    const update = { available };
    try {
      let res = await this.dm.findOneAndUpdate(filter, update);
      if (res) return true;
      else {
        this.log('error','AdminService -> findOneAndUpdate() in -> else res');
        throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      this.log('error',`AdminService -> findOneAndUpdate() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
