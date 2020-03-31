import { constants } from 'src/constants';
import { Data } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import * as SETTINGS from '../settings/settings.json';
import { Customer } from 'src/customers/customer.model';
var nodemailer = require('nodemailer');
import { Logger } from 'winston';
import { Inject, HttpException, HttpStatus, Req } from '@nestjs/common';

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: constants.mail.mail,
    pass: constants.mail.pass,
  },
});

export class DataService {
  constructor(
    @InjectModel('Data') private readonly dm: Model<Data>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async getData(req) {
    let host = req.body.host;
    let calendar = [];
    var weekStart = moment().utcOffset(0).set({hour:0,minute:0,second:0,millisecond:0})
      .clone()
      .startOf('week');

    let owner = SETTINGS.owners.filter((v, i) => {
      return v.calendar.website === host;
    });
    console.log('host', host);

    if (owner.length > 0) {
      for (let i = 0; i < owner[0].calendar.days * 2; i++) {
        let date = +moment(weekStart).add(i, 'days');
        let day = new Date(date);
        calendar.push((+day).toString());
      }
      console.log(calendar);
      
      try {
        let res = await this.dm
          .find({ host })
          .where('dayTimestamp')
          .in(calendar)
          .exec();
        console.log(res);
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
      let ownerMail = SETTINGS.owners.filter((v, i) => {
        return v.calendar.website === host;
      });
      if (ownerMail.length > 0) {
        const message = {
          from: contact.mail,
          to: ownerMail[0].calendar.mail,
          subject: ownerMail[0].mail.subject + contact.name,
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
    let owner = SETTINGS.owners.filter((v, i) => {
      return v.calendar.website === host;
    });
    if (owner.length > 0) {
      for (
        let h = owner[0].calendar.hours[0];
        h < owner[0].calendar.hours[1];

      ) {
        hours.push({
          hour: `${h}:00`,
          available: data.hour !== `${h}:00` ? true : false,
        });
        hours.push({
          hour: `${h}:30`,
          available: data.hour !== `${h}:30` ? true : false,
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
  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
