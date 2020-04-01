import { Injectable, Res, HttpStatus, Get, Req, HttpException, Logger, Inject } from '@nestjs/common';
import * as SETTINGS from './settings.json';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Settings } from './settings.model';
import { Model } from 'mongoose';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel('Settings') private readonly sm: Model<Settings>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get()
  getSettings(@Res() res: Response, @Req() req): any {
    let host = req.body.host;
    let owner = SETTINGS.owners.filter((v, i) => {
      return v.calendar.website === host;
    });

    if (owner.length > 0) {
      res.status(HttpStatus.OK).json(owner[0]);
    } else {
      res.status(HttpStatus.FORBIDDEN);
    }
  }
  async getSettingsFromDB(req) {
    let host = req.headers.origin;
    try {
      let res = await this.sm.findOne({ 'calendar.website' : host }).exec();
      if (res) {console.log(res);return res;}
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
