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
const fetch = require('node-fetch');
const hbs = require('nodemailer-express-handlebars');
const fs = require('fs');
const path = require('path');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: constants.mail.mail,
    pass: constants.mail.pass,
  },
});


const handlebarOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: './emails/customer',
    layoutsDir: './emails/customer',
    defaultLayout: 'contact.hbs',
  },
  viewPath: './emails/customer',
  extName: '.hbs', 
};

transporter.use('compile', hbs(handlebarOptions));


export class DataService {
  constructor(
    @InjectModel('Customer') private readonly cm: Model<Customer>,
    @InjectModel('Data') private readonly dm: Model<Data>,
    @Inject('winston') private readonly logger: Logger,
    private s: SettingsService,
  ) {
    //86400000 one day
    //setInterval(()=> this.backup(),+constants.backUpTime);
  }
  
  async backup(){
    //backup every day mongoDB
    const now = new Date();
    const data = await this.dm.find({dayTimestamp: { $gte: +moment().subtract(1, 'days').endOf('day')}}).exec();
    fs.writeFile(`files/data_${now.formattedDate()}.txt`, JSON.stringify(data), (err) => {
      if (err) console.log("Bad File");
    }
  );
    
    const customers = await this.cm.find({date: { $gte: +moment().subtract(1, 'days').endOf('day')}}).exec();
    fs.writeFile(`files/customers_${now.formattedDate()}.txt`, JSON.stringify(customers), (err) => {
      if (err) console.log("Bad File");
    }
  );
  }
  

  async getData(req) {
    let host = this.s.adminName;
    let calendar = [];
    var weekStart = moment()
      .clone()
      .startOf('week');

    let res = await this.s.getSettings();
    if (res) {
      for (
        let i = 0;
        i < 90; //check
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
  async getHolidays(req){
    
    return await fetch(`https://www.hebcal.com/hebcal/?v=1&cfg=json&maj=on&min=on&mod=on&nx=off&year=now&month=x&ss=off&mf=off&c=off&geo=geoname&geonameid=3448439&m=50&s=off`)
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
   return myJson;
  });

  }
  async deleteHour(data: Customer, req) {
    let host =this.s.adminName;
    try {
      let res = await this.dm.findOne({ dayTimestamp: data.date, host });
      if (res) {
        let hours = [];
        let found = false;
        let loops = 4 * +data.treatmentTime; 
        hours = res.hours.map((v, i) => {
          if (v.hour === data.hour || found){
            v.available = true;
            found = true;
            loops -=1;
            if (loops == 0)
              found = false;
          }
          return v;
        });
        try {
          let result = await this.dm
            .updateOne({ _id: res._id }, { hours })
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
    //https://stackoverflow.com/questions/45478293/username-and-password-not-accepted-when-using-nodemailer

    try {
      let resSettings = await this.s.getSettings();
      if (resSettings) {
        let i18n = resSettings.i18n['He'].calendar;
        const message = {
          from: contact.mail,
          to: resSettings.owner.mail,
          subject: resSettings.i18n['En'].contact.subject + contact.name,
          text: contact.message + ' from: ' + contact.phone,
          context: {
            contact,
            i18n,
        },
        template: 'contact',
        };
          let res = await transporter.sendMail(message);
        if (res) {
          return true;
        } else {
          this.log('error', 'DataService -> sendContact() in -> else res');
          return false;
        }
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

  async setHour(data, req,edit=false) {
    let host = this.s.adminName;
    let res = await this.dm.findOne({ dayTimestamp: +data.date, host }).exec();
    let hours = [];
    //loop hours
    //algorythem - formula => 1/admin cal ( = num of curters ) X treatment time = loops
    if (res && res.hours) {
      let found = false;
      let loops = 4 * +data.treatmentTime;
      hours = res.hours.map((v, i) => {
        if (v.hour === data.hour || found){
          v.available = false;
          found = true;
          loops -=1;
          if (loops == 0)
            found = false;
        }
        return v;
      });

      if (edit){
        let found = false;
        let loops = 4 * +data.oldTreatmentTime;
        hours = hours.map((v, i) => {
          if (v.hour === data.oldHour || found){
            v.available = true;
            found = true;
            loops -=1;
            if (loops == 0)
              found = false;
          }
          return v;
        });
      }
      const result = await this.dm
        .updateOne({ _id: res._id }, { hours })
        .exec();
      if (result.n === 0) {
        this.log('error', 'DataService -> setHour() in -> result = 0'); 
        return false;
      } else {
        return true;
      }
    } else {
      this.addCalendarDay(data, req);
      return true;
    }
  }

  async addCalendarDay(data, req) {
    let host = this.s.adminName;
    let hours = [];
    let resSettings = await this.s.getSettings();
    let hoursSettings =
      resSettings.calendar.days[moment(+data.date).day() % 7].hours;
    hoursSettings.forEach((hour, i) => {
      hour = hour.length == 1 ? '0' + hour : hour;
      ['00', '15', '30', '45'].forEach(minutes => {
        hours.push({
          hour: `${hour}:${minutes}`,
          available: true,
        });
      });
    });
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
      } else {
        //save new day - so set hour
        if (await this.setHour(data, req)) return true;
        else {
          this.log('error', `DataService ->  addCalendarDay setHour()`);
          return false;
        }
      }
    } catch (error) {
      this.log('error', `DataService -> addCalendarDay() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async userDetails(req) {
    let host = this.s.adminName;
    let username = req.body.username;
    try {
      const user = await this.cm
        .findOne(
          { username, host },
          { _id: 0, id: 0},
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
