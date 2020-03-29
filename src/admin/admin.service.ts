import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Data } from 'src/data/data.model';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { Customer } from 'src/customers/customer.model';
import { Admin } from './admin.model';
import { constants } from 'src/constants';
import * as SETTINGS from './../settings/settings.json';
var jwt = require('jsonwebtoken');

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Admin') private readonly am: Model<Admin>,
    @InjectModel('Customer') private readonly cm: Model<Customer>,
    @InjectModel('Data') private readonly dm: Model<Data>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async getMyTreatments(): Promise<boolean | PromiseLike<boolean>> {
    try {
      let res = await this.cm.find();
      if (res) return res;
      else {
        this.log('error', 'AdminService -> getMyTreatments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `AdminService -> getMyTreatments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async checkPermissions(token: Admin) {
    try {
      return jwt.verify(token.username, constants.jwtSecret, async (err, decoded) => {
        if (decoded.username === SETTINGS.calendar.mail) {
          let res = await this.am.find({ username: decoded.username });
          if (res.length > 0) return true;
          else {
            this.log(
              'error',
              'AdminService -> checkPermissions() in -> else res',
            );
            return false;
          }
        }else{
          return false; //not an admin
        }
      });
    } catch (error) {
      this.log('error', `AdminService -> checkPermissions() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async setAvailability(dayTimestamp: string, available: boolean) {
    const filter = { dayTimestamp };
    const update = { available };
    try {
      let res = await this.dm.findOneAndUpdate(filter, update);
      if (res) return true;
      else {
        this.log('error', 'AdminService -> findOneAndUpdate() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `AdminService -> findOneAndUpdate() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
