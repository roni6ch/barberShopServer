import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Data } from 'src/data/data.model';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { Customer } from 'src/customers/customer.model';
import { SettingsService } from 'src/settings/settings.service';
import { Settings } from 'src/settings/settings.model';
import { Auth } from 'src/auth/auth.model';
import * as moment from 'moment';


@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Settings') private readonly sm: Model<Settings>,
    @InjectModel('Auth') private readonly am: Model<Auth>,
    @InjectModel('Customer') private readonly cm: Model<Customer>,
    @InjectModel('Data') private readonly dm: Model<Data>,
    @Inject('winston') private readonly logger: Logger,
    private s: SettingsService,
  ) {}

  async getMyTreatments(req){
    let host = req.body.host;
    try {
      let res = await this.cm.find({host,date: { $gte:+moment().subtract(0,'days').endOf('day')} });
      if (res) return res;
      else {
        this.log('error', 'AdminService -> getMyTreatments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `AdminService -> getMyTreatments() => ${error}`);
      return new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async checkPermissions(req) {
    let host = req.body.host;
    try {
    let res = await this.s.getSettingsFromDB(req);
        if (res)
          if (req.body.username.toLowerCase() === res.calendar.mail.toLowerCase()) {
            let res = await this.am.find({ username: req.body.username });
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

  async updateAdmin(adminDetails, req) {
    let host = req.body.host;
    try {
      let result = await this.sm
        .findOneAndUpdate({  'calendar.website' : host },
        { 'calendar.location' : adminDetails.location ,
          'owner.phone' : adminDetails.phone,
          'calendar.days' : adminDetails.days,
          'calendar.slides' : adminDetails.slides,
          'treatments' : adminDetails.treatments,
          'galleryDisplay':adminDetails.galleryDisplay,
          'personals':adminDetails.personals
           })
        .exec();
        console.log(result);
      if (result) {
        this.s.settings = null;
        return result;
      } else {
        this.log('error', 'DataService -> updateAdmin() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `DataService -> updateAdmin() => ${error}`);
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
