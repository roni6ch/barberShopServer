import { Injectable, Res, HttpStatus, Get, Req, HttpException, Logger, Inject } from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Settings } from './settings.model';
import { Model } from 'mongoose';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class SettingsService {
  settings : Settings = null;
  constructor(
    @InjectModel('Settings') private readonly sm: Model<Settings>,
    @Inject('winston') private readonly logger: Logger,
  ) {
  }

  async getSettingsFromDB(req) {
    if (this.settings !== null){
      return this.settings;
    }
    let host = req.headers.origin;
    try {
      let res = await this.sm.findOne({ 'calendar.website' : host }).exec();
      if (res) {this.settings = res;return res;}
      else {
        this.log('error', 'DataService -> getData() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `DataService -> getData() => ${error}`);
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
