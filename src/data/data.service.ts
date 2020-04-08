import { SettingsService } from './../settings/settings.service';
import { constants } from 'src/constants';
import { Data } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { Customer } from 'src/customers/customer.model';
var nodemailer = require('nodemailer');
import { Logger } from 'winston';
import { Inject, HttpException, HttpStatus, Req } from '@nestjs/common';
import { Admin } from 'src/admin/admin.model';
import { Settings } from 'src/settings/settings.model';

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: constants.mail.mail,
    pass: constants.mail.pass,
  },
});

export class DataService {
  constructor(
    @InjectModel('Settings') private readonly sm: Model<Settings>,
    @InjectModel('Customer') private readonly cm: Model<Customer>,
    @InjectModel('Data') private readonly dm: Model<Data>,
    @Inject('winston') private readonly logger: Logger,
    private s: SettingsService,
  ) {}

  async getData(req) {
    let host = req.body.host;
    let calendar = [];
    var weekStart = moment()
      .clone()
      .startOf('week');

    let res = await this.s.getSettingsFromDB(req);
    if (res) {
      for (let i = 0; i < res.calendar.slides * 14; i++) {
        let date = moment(weekStart).add(i, 'days');
        calendar.push((+new Date(+date)).toString());
      }

      try {
        let res = await this.dm
          .find({ host ,dayTimestamp: { $gte:+moment().subtract(0,'days').endOf('day')}  })
          // .where('dayTimestamp').in(calendar)
          .exec();
        if (res) return res;
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
    } else {
      this.log('error', 'DataService -> getData() in -> no owner');
    }
  }
  async setHour(data, req) {
    let host = req.body.host;
    let res = await this.dm.findOne({ dayTimestamp: +data.date, host }).exec();
    if (res) {
      let resHours = res.hours.map((v, i) => {
        if (v.hour === data.hour) {
          v.available = false;
        }
        return v;
      });
      if (resHours.length > 0) {
        const result = await this.dm
          .updateOne({ _id: res._id }, { hours: resHours })
          .exec();
        if (result.n === 0) {
          this.log('error', 'DataService -> setHour() in -> result = 0');
          return false;
        } else {
          console.log('updated!!!');
          return true;
        }
      } else {
        console.log('no res', res);
        this.log('error', 'DataService -> setHour() in -> else res');
        return new HttpException(
          'ExceptionFailed',
          HttpStatus.EXPECTATION_FAILED,
        );
      }
    }
    this.addCalendarDay(data, req);
    return true;
  }
  async deleteHour(data: Customer, req) {
    let host = req.body.host;
    try {
      let res = await this.dm.findOne({ dayTimestamp: data.date, host });
      if (res) {
        let resHours = res.hours.map((v, i) => {
          if (v.hour === data.hour) {
            v.available = true;
          }
          return v;
        });
        res.hours = resHours;

        try {
          let result = await this.dm
            .updateOne({ _id: res._id }, { hours: resHours })
            .exec();
          if (result.n === 0) {
            this.log('error', `DataService -> updateOne() => empty res`);
            return false;
          }
          return true;
        } catch (error) {
          this.log('error', `DataService -> updateOne() => ${error}`);
          return new HttpException(
            'ExceptionFailed',
            HttpStatus.EXPECTATION_FAILED,
          );
        }
      } else {
        this.log('error', 'DataService -> findOne() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `DataService -> findOne() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async deleteOldDocuments(oldMonth){
    try {
      let res = await this.dm.deleteMany({"dayTimestamp" : { $lt : oldMonth }});
      console.log('res',res);
      if (res) return res;
      else {
        this.log('error', 'DataService -> delete() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `DataService -> deleteOldDocuments() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  async deleteAllDocuments() {
    try {
      let res = await this.dm.deleteMany();
      if (res) return res;
      else {
        this.log('error', 'DataService -> deleteAllDocuments() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `DataService -> deleteAllDocuments() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  async sendContact(contact, req) {
    let host = req.body.host;
    //https://stackoverflow.com/questions/45478293/username-and-password-not-accepted-when-using-nodemailer

    try {
      let resSettings = await this.s.getSettingsFromDB(req);
      if (resSettings) {
        const message = {
          from: contact.mail,
          to: resSettings.calendar.mail,
          subject: resSettings.mail.subject + contact.name,
          text: contact.message + ' from: ' + contact.phone,
        };
        let res = await transporter.sendMail(message);
        if (res) {
          console.log('Email succsess!');
          return true;
        } else {
          this.log('error', 'DataService -> sendContact() in -> else res');
          return false;
        }
      } else {
        this.log('error', `DataService -> sendContact() => no owner mail`);
      }
    } catch (error) {
      this.log('error', `DataService -> sendContact() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  async addCalendarDay(data, req) {
    let host = req.body.host;
    console.log('new day -> create one');
    let hours = [];
    let resSettings = await this.s.getSettingsFromDB(req);
    console.log(data);
    
    let hoursSettings = resSettings.calendar.days[moment(+data.date).day() % 7].hours;
    if (resSettings) {
      for (
        let h = 0;
        h < hoursSettings.length;

      ) {
        hours.push({
          hour: `${hoursSettings[h]}:00`,
          available: data.hour !== `${hoursSettings[h]}:00` ? true : false,
        });
        hours.push({
          hour: `${hoursSettings[h]}:30`,
          available: data.hour !== `${hoursSettings[h]}:30` ? true : false,
        });
        h++;
      }
      const newCalendarDay = new this.dm({
        dayTimestamp: data.date,
        available: true,
        hours,
        host,
      });

      try {
        let result = await newCalendarDay.save();
        if (result.n === 0) {
          this.log('error', `DataService -> addCalendarDay() => empty res`);
          return false;
        }
        return result;
      } catch (error) {
        this.log('error', `DataService -> addCalendarDay() => ${error}`);
        return new HttpException(
          'ExceptionFailed',
          HttpStatus.EXPECTATION_FAILED,
        );
      }
    }
  }

  async updateAdmin(adminDetails, req) {
    let host = req.body.host;
    console.log(adminDetails);
    try {
      let result = await this.sm
        .updateOne({  'calendar.website' : host },
        { 'calendar.location' : adminDetails.location ,
          'owner.phone' : adminDetails.phone,
          'calendar.days' : adminDetails.days,
          'calendar.hours' : adminDetails.hours,
          'calendar.slides' : adminDetails.slides,
          'treatments' : adminDetails.treatments,
          'galleryDisplay':adminDetails.galleryDisplay,
          'personals':adminDetails.personals
           })
        .exec();
      if (result.n === 1) {
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

  async userDetails(req) {
    let host = req.body.host;
    let username = req.body.username;
    try {
      const user = await this.cm.findOne({ username, host }, { _id:0 ,id:0, date:0,dateStr:0,hour:0}).exec();
      if (user) {
        return user;
      }
      else{
        return false;
      }
    } catch (error) {
      this.log('error', `UsersService -> validateGoogleUser() => ${error}`);
      throw new HttpException(
        'Problem with saving the user validateGoogleUser',
        HttpStatus.FORBIDDEN,
      );
    }
  }
  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
