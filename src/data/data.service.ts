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
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: constants.mail.mail,
    pass: constants.mail.pass,
  },
});

export class DataService {
  constructor(
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
      for (
        let i = 0;
        i < res.calendar.slides * this.s.settings.calendar.calendarSize;
        i++
      ) {
        let date = moment(weekStart).add(i, 'days');
        calendar.push((+new Date(+date)).toString());
      }

      try {
        //end of yasterday
        let res = await this.dm
          .find({
            host,
            dayTimestamp: {
              $gte: +moment()
                .subtract(1, 'days')
                .endOf('day'),
            },
          })
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
      return false;
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
  async deleteOldDocuments(oldMonth) {
    try {
      let res = await this.dm.deleteMany({ dayTimestamp: { $lt: oldMonth } });
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
      if (res) return true;
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
          to: resSettings.owner.mail,
          subject: resSettings.i18n['En'].contact.subject + contact.name,
          text: contact.message + ' from: ' + contact.phone,
        };
     /*  let res = await transporter.sendMail(message);
        if (res) {
          console.log('Email succsess!');
          return true;
        } else {
          this.log('error', 'DataService -> sendContact() in -> else res');
          return false;
        }*/
      } else {
        this.log('error', `DataService -> sendContact() => no owner mail`);
        return false;
      }
    } catch (error) {
      this.log('error', `DataService -> sendContact() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }


  async setHour2(data, req) {
    let host = req.body.host;
    let res = await this.dm.findOne({ dayTimestamp: +data.date, host }).exec();
    
    let hours = [];
    let resSettings = await this.s.getSettingsFromDB(req);
    let hoursSettings = resSettings.calendar.days[moment(+data.date).day() % 7].hours;
    if (res && res.hours) {
      //loop hours
      
    }
  }


  async addCalendarDay(data, req) {
    let host = req.body.host;
    console.log('new day -> create one');
    let hours = [];
    let resSettings = await this.s.getSettingsFromDB(req);
    let hoursSettings = resSettings.calendar.days[moment(+data.date).day() % 7].hours;
    if (resSettings) {
      let timeSpacing = resSettings.calendar.timeSpacing;
      let minutesArr = ["00"];
      if (timeSpacing == '0.25') minutesArr = ["00", "15", "30", "45"];
      else if(timeSpacing == '0.5') minutesArr = ["00", "30"];
      let addedHour = 0;

      let loopNotAvailableTimes = 0;
      let startLoop = false;
      for (let h = 0; h < hoursSettings.length - addedHour; h++) { // if the same hour and minut then start count
          minutesArr.forEach((minutes) => {
            if (hoursSettings[h] == data.hour.split(":")[0] && minutes == data.hour.split(":")[1]){
              loopNotAvailableTimes = +data.treatmentTime / +timeSpacing;
              startLoop = true;
            }
            hours.push({
              hour: `${hoursSettings[h]}:${minutes}`,
              available: !startLoop ? true : false,
            });
            if (startLoop){
              loopNotAvailableTimes -= 1;
              console.log('loop times',loopNotAvailableTimes);
              if (loopNotAvailableTimes == 0){
                startLoop = false;
              }
            }
            
          });
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

  async userDetails(req) {
    let host = req.body.host;
    let username = req.body.username;
    try {
      const user = await this.cm
        .findOne(
          { username, host },
          { _id: 0, id: 0, date: 0, dateStr: 0, hour: 0 },
        )
        .exec();
      if (user) {
        return user;
      } else {
        return false;
      }
    } catch (error) {
      this.log('error', `AuthService -> validateGoogleUser() => ${error}`);
      return new HttpException(
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
