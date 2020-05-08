import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { Auth } from './auth.model';
import { constants } from 'src/constants';
import { SettingsService } from 'src/settings/settings.service';
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: constants.mail.mail,
    pass: constants.mail.pass,
  },
});

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Auth') private readonly um: Model<Auth>,
    @Inject('winston') private readonly logger: Logger,
    private s: SettingsService,
  ) {}

  async register(username, password, req) {
    let host = this.s.adminName;
    username = username.toLowerCase();
    try {
      let findUser = await this.um.findOne({ username, host }).exec();
      if (!findUser) {
        try {

          var password = bcrypt.hashSync(password, salt);
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
            this.log('error', 'AuthService -> save() in -> else res');
            throw new HttpException(
              'Problem with saving the user',
              HttpStatus.FORBIDDEN,
            );
          }
        } catch (error) {
          this.log('error', `AuthService -> save() => ${error}`);
          throw new HttpException(
            'ExceptionFailed',
            HttpStatus.EXPECTATION_FAILED,
          );
        }
      } else {
        this.log(
          'error',
          'AuthService -> findOne() in -> user already exist!',
        );
        return new HttpException('user already exist!', HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      this.log('error', `AuthService -> findOne() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async validateUser(username: string, password: string, req) {
    let host = this.s.adminName;
    username = username.toLowerCase();
    const user = await this.um.findOne({ username, host }).exec();
    if (user !== null) {
      if (bcrypt.compareSync(password, user.password))
        return this.generateToken(username, password);
      else {
        return new HttpException('password incorrect', HttpStatus.FORBIDDEN);
      }
    } else {
      return new HttpException('no such user', HttpStatus.FORBIDDEN);
    }
  }

  async validateGoogleUser(username: string, req) {
    let host = this.s.adminName;
    username = username.toLowerCase();
    let password = Math.random()
      .toString(36)
      .slice(-8);
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
        await this.sendEmailPassword(username, password, req);
      } catch (error) {
        this.log('error', `AuthService -> validateGoogleUser() => ${error}`);
        throw new HttpException(
          'Problem with saving the user validateGoogleUser',
          HttpStatus.FORBIDDEN,
        );
      }
    }
    return this.generateToken(username, data.password);
  }

  async sendEmailPassword(contact, password, req) {
    try {
      let resSettings = await this.s.getSettings();
      if (resSettings) {
        const message = {
          from: resSettings.owner.mail,
          to: contact,
          subject: 'Message from: ' + resSettings.owner.website,
          text:
            'Please keep your password: ' +
            password +
            'for user: ' +
            contact +
            ' or login with google Button :)',
        };
       /* let res = await transporter.(message);
        if (res) {
          console.log('Email succsess!');
          return true;
        } else {
          this.log(
            'error',
            'AuthService -> sendEmailPassword() in -> else res',
          );
          return false;
        }*/
      } else {
        this.log(
          'error',
          `AuthService -> sendEmailPassword() => no owner mail`,
        );
      }
    } catch (error) {
      this.log('error', `AuthService -> sendEmailPassword() => ${error}`);
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
  async forgotPassword(username, req) {
    let host = this.s.adminName;
    try {
      const user = await this.um.findOne({ username, host }).exec();
      if (user !== null) {
        await this.sendEmailPassword(username, user.password, req);
      } else {
        return new HttpException('no such user', HttpStatus.FORBIDDEN);
      }
    }catch(error){
      this.log('error', `AuthService -> forgotPassword() => ${error}`);
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }

  async changePassword(req) {
    let host = this.s.adminName;
    let username = req.body.username;
     let password = bcrypt.hashSync(req.body.password, salt);
     let newPassword = bcrypt.hashSync(req.body.newpassword, salt);

    try {
      const res = await this.um.findOneAndUpdate({ username,password, host },{password:newPassword}).exec();
      if (res !== null) {
        await this.sendEmailPassword(username, newPassword, req);
        return true;
      } else {
        return false;
      }
    }catch(error){
      this.log('error', `AuthService -> forgotPassword() => ${error}`);
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
