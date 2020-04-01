import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { User } from './users.model';
import { constants } from 'src/constants';
var nodemailer = require('nodemailer');
import { SettingsService } from 'src/settings/settings.service';
var jwt = require('jsonwebtoken');


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: constants.mail.mail,
    pass: constants.mail.pass,
  },
});

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Users') private readonly um: Model<User>,
    @Inject('winston') private readonly logger: Logger,
    private s: SettingsService
  ) {}

  async register(username, password, req) {
    let host = req.body.host;
    try {
      let findUser = await this.um.findOne({ username, host }).exec();
      if (!findUser) {
        try {
          let data = {
            username,
            password,
            host,
          };
          const newUser = new this.um(data);
          let res = await newUser.save();

          if (res) {
            return await this.generateToken(username, password);
          } else {
            this.log('error', 'UsersService -> save() in -> else res');
            throw new HttpException(
              'Problem with saving the user',
              HttpStatus.FORBIDDEN,
            );
          }
        } catch (error) {
          this.log('error', `UsersService -> save() => ${error}`);
          throw new HttpException(
            'ExceptionFailed',
            HttpStatus.EXPECTATION_FAILED,
          );
        }
      } else {
        this.log(
          'error',
          'UsersService -> findOne() in -> user already exist!',
        );
        return new HttpException('user already exist!', HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      this.log('error', `UsersService -> findOne() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async validateUser(username: string, password: string, req) {
    let host = req.body.host;
    const user = await this.um.findOne({ username, host }).exec();
    if (user !== null) {
      if (password === user.password)
        return this.generateToken(username, password);
      else {
        return new HttpException('password incorrect', HttpStatus.FORBIDDEN);
      }
    } else {
      return new HttpException('no such user', HttpStatus.FORBIDDEN);
    }
  }

  async validateGoogleUser(username: string, req) {
    let host = req.body.host;
    let password = Math.random().toString(36).slice(-8);
    let data = {
      username,
      password, //password generator
      host,
    };
    const user = await this.um.findOne({ username, host }).exec();
    if (!user) {
      try {
        const newUser = new this.um(data);
        await newUser.save();
        await this.sendEmailPassword(username,password,req);
      } catch(error){
        this.log(
          'error',
          `UsersService -> validateGoogleUser() => ${error}`,
        );
        throw new HttpException(
          'Problem with saving the user validateGoogleUser',
          HttpStatus.FORBIDDEN,
        );
      }
    }
    return this.generateToken(username, data.password);
  }

  async sendEmailPassword(contact,password, req) {
    let host = req.body.host;
    try {
      let resSettings = await this.s.getSettingsFromDB(req);
      if (resSettings) {
        const message = {
          from: resSettings.calendar.mail,
          to: contact,
          subject: 'Message from: ' + resSettings.calendar.website,
          text: "Please keep your password: " + password + 'for user: ' + contact + ' or login with google Button :)',
        };
        let res = await transporter.sendMail(message);
        if (res) {
          console.log('Email succsess!');
          return true;
        } else {
          this.log('error', 'UsersService -> sendEmailPassword() in -> else res');
          return false;
        }
      } else {
        this.log('error', `UsersService -> sendEmailPassword() => no owner mail`);
      }
    } catch (error) {
      this.log('error', `UsersService -> sendEmailPassword() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async generateToken(username: string, password: string) {
    return {
      idToken: jwt.sign({ username, password }, constants.jwtSecret, {
        expiresIn: '1h',
      }),
    };
  }

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
