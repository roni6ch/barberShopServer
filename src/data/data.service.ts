import { constants } from 'src/constants';
import { Data } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import * as SETTINGS from '../settings/settings.json';
import { Customer } from 'src/customers/customer.model';
var nodemailer = require('nodemailer');
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: constants.mail.mail,
    pass: constants.mail.pass,
  },
});

export class DataService {
  private data: Data[] = [];

  constructor(
    @InjectModel('Data') private readonly dm: Model<Data>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async deleteAllDocuments() {
    try {
      let res = await this.dm.deleteMany();
      if (res) return res;
      else {
        this.log('error', 'DataService -> deleteAllDocuments() in -> else res');
      }
    } catch (error) {
      this.log('error', `DataService -> deleteAllDocuments() => ${error}`);
    }
  }

  async getData() {
    let calendar = [];
    var weekStart = moment()
      .clone()
      .startOf('week');
    for (let i = 0; i < SETTINGS.calendar.days * 2; i++) {
      let date = +moment(weekStart).add(i, 'days');
      calendar.push(+new Date(date));
    }
    try {
      let res = await this.dm
        .find()
        .where('dayTimestamp')
        .in(calendar)
        .exec();
      if (res) return res;
      else {
        this.log('error', 'DataService -> getData() in -> else res');
      }
    } catch (error) {
      this.log('error', `DataService -> getData() => ${error}`);
    }
  }

  async deleteHour(data: Customer) {
    try {
      let res = await this.dm.findOne({ dayTimestamp: data.date });
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
        }
      } else {
        this.log('error', 'DataService -> deleteHour() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `DataService -> deleteHour() => ${error}`);
      return false;
    }
  }

  async setHour(data) {
    let res = await this.dm.findOne({ dayTimestamp: +data.date }).exec();
    if (res) {
      console.log('res found!');
      let resHours = res.hours.map((v, i) => {
        if (v.hour === data.hour) {
          v.available = false;
        }
        return v;
      });
      if (resHours.length > 0) {
        console.log('res length!');
        const result = await this.dm
          .updateOne({ _id: res._id }, { hours: resHours })
          .exec();
        if (result.n === 0) {
          console.log('not updated!');
          return false;
        } else {
          console.log('updated!!!');
          return true;
        }
      } else {
        console.log('no res', res);
      }
      return false;
    }
    this.addCalendarDay(data);
  }
  async addCalendarDay(data) {
    console.log('new day -> create one');
    let hours = [];
    for (let h = SETTINGS.calendar.hours[0]; h < SETTINGS.calendar.hours[1]; ) {
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
    }
  }

  async sendContact(contact): Promise<boolean> {
    console.log(contact);
    const message = {
      from: contact.mail,
      to: constants.mail.mailFrom,
      subject: SETTINGS.mail.subject + contact.name,
      text: contact.message + ' from: ' + contact.phone,
    };
    //https://stackoverflow.com/questions/45478293/username-and-password-not-accepted-when-using-nodemailer

    try {
      let res = await transporter.sendMail(message);
      if (res) {
        console.log('Email succsess!');
        return true;
      } else {
        this.log('error', 'DataService -> sendContact() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `DataService -> sendContact() => ${error}`);
      return false;
    }
  }

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
