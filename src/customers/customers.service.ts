import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.model';
import { Logger } from 'winston';
import * as moment from 'moment';
import { SettingsService } from 'src/settings/settings.service';
import { constants } from 'src/constants';
const ics = require('ics');

var nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

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
    defaultLayout: 'index.hbs',
  },
  viewPath: './emails/customer',
  extName: '.hbs',
};

transporter.use('compile', hbs(handlebarOptions));

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel('Customer') private readonly cm: Model<Customer>,
    @Inject('winston') private readonly logger: Logger,
    private s: SettingsService,
  ) {}

  async deleteOldDocuments(oldMonth) {
    try {
      let res = await this.cm.deleteMany({ date: { $lt: oldMonth } });
      if (res) return res;
      else {
        this.log('error', 'CustomersService -> delete() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `CustomersService -> deleteOldDocuments() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
  async deleteAllDocuments() {
    try {
      let res = await this.cm.deleteMany();
      if (res) return res;
      else {
        this.log(
          'error',
          'CustomersService -> deleteAllDocuments() in -> else res',
        );
        return false;
      }
    } catch (error) {
      this.log('error', `CustomersService -> deleteAllDocuments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async addTreatment(customer, req) {
    console.log('addTreatment');
    customer.host = this.s.adminName;
    customer.username = req.body.username.toLowerCase();
    console.log(customer);
    const newTreatment = new this.cm(customer);
    try {
      let res = await newTreatment.save();

      let dateStart = [
        +moment(+customer.date).format('YYYY'),
        +moment(+customer.date).format('M'),
        +moment(+customer.date).format('D'),
        +customer.hour.split(':')[0],
        +customer.hour.split(':')[1],
      ];

      const event = {
        start: dateStart,
        duration: {
          minutes: +customer.treatmentTime * 60,
        },
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
      };

      await this.sendUserMail(customer, req, true, event);
      if (res) return res;
      else {
        this.log('error', 'CustomersService -> save() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `CustomersService -> save() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  async editTreatment(data, req) {
    let customer = data.customer;
    console.log('editTreatment');
    let host = this.s.adminName;
    customer.username = req.body.username.toLowerCase();
    let _id = customer._id;
    delete customer._id;
    try {
      let res = await this.cm.findOneAndUpdate({ _id, host }, customer, {new: true}).exec();

      let dateStart = [
        +moment(+customer.date).format('YYYY'),
        +moment(+customer.date).format('M'),
        +moment(+customer.date).format('D'),
        +customer.hour.split(':')[0],
        +customer.hour.split(':')[1],
      ];

      const event = {
        start: dateStart,
        duration: {
          minutes: +customer.treatmentTime * 60,
        },
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
      };
      if (data.sendMail)
        await this.sendUserMail(customer, req, true,event);
      if (res) return res;
      else {
        this.log('error', 'CustomersService -> save() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `CustomersService -> save() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async deleteTreatment(data: Customer, req) {
    console.log('deleteTreatment');
    let host = this.s.adminName;
    try {
      let res = await this.cm.deleteOne({ _id: data['_id'], host }).exec();
      if (res.n > 0) {
        //todo - send email to customer

        let dateStart = [
          +moment(+data.date).format('YYYY'),
          +moment(+data.date).format('M'),
          +moment(+data.date).format('D'),
          +data.hour.split(':')[0],
          +data.hour.split(':')[1],
        ];

      const event = {
        start: dateStart,
        duration: {
          minutes: +data.treatmentTime * 60,
        },
        status: 'CANCELLED',
        busyStatus: 'BUSY',
      };

        await this.sendUserMail(data, req, false,event);
        return data;
      } else {
        this.log('error', 'CustomersService -> deleteOne() in -> else res');
        return false;
      }
    } catch (error) {
      this.log('error', `CustomersService -> deleteOne() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async sendUserMail(data, req, schedule, event) {
    try {

      console.log('sendUserMail');
      let resSettings = await this.s.getSettings();
      let i18n = resSettings.i18n[data.lang].calendar;
      
      event.title = i18n.titleH1 + ' ' + i18n.titleH1span,
      event.description = resSettings.i18n[data.lang].contact.calendarInfo,
      event.location = resSettings.owner.location,
      event.organizer = {
        name: i18n.titleH1 + ' ' + i18n.titleH1span,
        email: resSettings.owner.mail,
      };

      if (resSettings) {
        ics.createEvent(event, (error, value) => {
          if (error) {
            console.log(error);
            return;
          }
          const message = {
            from: resSettings.owner.mail,
            to: data.username,
            subject: 'Message from: ' + resSettings.owner.website,
            context: {
              data,
              i18n,
              owner: resSettings.owner,
              schedule: schedule
                ? i18n.appointmentScheduled
                : i18n.appointmentCanceled,
            },
            icalEvent: {
              content: value,
              method: 'request',
            },
            template: 'index',
          };

          transporter.sendMail(message, (err, message) => {
            if (message) {
              console.log('Email succsess!');
              return true;
            } else {
              this.log(
                'error',
                'CustomersService -> sendUserMail() in -> else res',
              );
              return false;
            }
          });
        });
      } else {
        this.log(
          'error',
          `CustomersService -> sendUserMail() => no owner mail`,
        );
      }
    } catch (error) {
      this.log('error', `CustomersService -> sendUserMail() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async userTreatments(req) {
    let host = this.s.adminName;
    let username = req.body.username;
    try {
      let res = await this.cm
        .find({
          host,
          username,
          date: {
            $gte: +moment()
              .subtract(0, 'days')
              .endOf('day'),
          },
        })
        .sort({ date: 'asc' })
        .exec();
      if (res) return res;
      else {
        this.log(
          'error',
          'CustomersService -> userTreatments() in -> else res',
        );
        return false;
      }
    } catch (error) {
      this.log('error', `CustomersService -> userTreatments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async userTreatmentsOld(req) {
    let host = this.s.adminName;
    let username = req.body.username;
    try {
      let res = await this.cm
        .find({
          host,
          username,
          date: {
            $lte: +moment()
              .subtract(0, 'days')
              .endOf('day'),
          },
        })
        .exec();
      if (res) return res;
      else {
        this.log(
          'error',
          'CustomersService -> userTreatments() in -> else res',
        );
        return false;
      }
    } catch (error) {
      this.log('error', `CustomersService -> userTreatments() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  async adminSearchTreatmentsOld(param, req) {
    let host = this.s.adminName;
    try {
      let res = await this.cm
        .find({
          host,
          $or: [
            { username: { $regex: param } },
            { name: { $regex: param } },
            { phone: { $regex: param } },
          ],
          date: {
            $lte: +moment()
              .subtract(0, 'days')
              .endOf('day'),
          },
        })
        .exec();
      if (res) return res;
      else {
        this.log(
          'error',
          'CustomersService -> adminSearchTreatmentsOld() in -> else res',
        );
        return false;
      }
    } catch (error) {
      this.log(
        'error',
        `CustomersService -> adminSearchTreatmentsOld() => ${error}`,
      );
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
