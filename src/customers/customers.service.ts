import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.model';
import { Logger } from 'winston';
import * as moment from 'moment';
import { SettingsService } from 'src/settings/settings.service';
import { constants } from 'src/constants';

var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: constants.mail.mail,
    pass: constants.mail.pass,
  },
});

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
    customer.host = req.body.host;
    customer.username = req.body.username.toLowerCase();
    const newTreatment = new this.cm(customer);
    try {
      let res = await newTreatment.save();
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
    let host = req.body.host;
    try {
      let res = await this.cm.deleteOne({ _id: data['_id'], host }).exec();
      if (res.n > 0) {
        //todo - send email to customer
        await this.sendUserDeleteMail(data,req);
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


  async sendUserDeleteMail(data, req) {
    let host = req.body.host;
    try {
      let resSettings = await this.s.getSettingsFromDB(req);
      if (resSettings) {
        const message = {
          from: resSettings.owner.mail,
          to: data.username,
          subject: 'Message from: ' + resSettings.owner.website,
          text:`Your Appointment to Barber, at ${data.dateStr} - ${data.hour} was canceled!`
            
        };
        let res = await transporter.sendMail(message);
        if (res) {
          console.log('Email succsess!');
          return true;
        } else {
          this.log(
            'error',
            'CustomersService -> sendUserDeleteMail() in -> else res',
          );
          return false;
        }
      } else {
        this.log(
          'error',
          `CustomersService -> sendUserDeleteMail() => no owner mail`,
        );
      }
    } catch (error) {
      this.log('error', `CustomersService -> sendEmailPassword() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }




  async userTreatments(req) {
    let host = req.body.host;
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
        }).sort({'date': 'asc'})
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
    let host = req.body.host;
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
    let host = req.body.host;
    try {
      let res = await this.cm
        .find({
          host,
          $or: [{ username: param }, { name: param }, { phone: param }],
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
