import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { User } from './users.model';
import { constants } from 'src/constants';
var jwt = require('jsonwebtoken');


@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Users') private readonly um: Model<User>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async register(username, password,req) {
    let host = req.body.host;
    try {
      let findUser = await this.um.findOne({ username ,host}).exec();
      if (!findUser) {
        try {
          let data = {
            username,
            password,
            host
          };
          const newUser = new this.um(data);
          let res = await newUser.save();
          
          if (res) {
            return await this.generateToken(username, password);
          }
          else {
            this.log('error', 'UsersService -> save() in -> else res');
            throw new HttpException('Problem with saving the user', HttpStatus.FORBIDDEN);
          }
        } catch (error) {
          this.log('error', `UsersService -> save() => ${error}`);
          throw new HttpException(
            'ExceptionFailed',
            HttpStatus.EXPECTATION_FAILED,
          );
        }
      } else {
        this.log('error', 'UsersService -> findOne() in -> user already exist!');
        return new HttpException('user already exist!', HttpStatus.FORBIDDEN);
      }
    } catch (error) {
      this.log('error', `UsersService -> findOne() => ${error}`);
      throw new HttpException('ExceptionFailed', HttpStatus.EXPECTATION_FAILED);
    }
  }



  async validateUser(username: string, password: string,req) {
    let host = req.body.host;
    const user = await this.um.findOne({ username,host }).exec();
    if (user !== null) {
      if (password === user.password)  return this.generateToken(username, password);
      else {
        return new HttpException('password incorrect', HttpStatus.FORBIDDEN);
      }
    } else {
       return new HttpException('no such user', HttpStatus.FORBIDDEN);
    }
  }


  async generateToken(username: string, password: string) {
    return {
      idToken: jwt.sign({ username, password },constants.jwtSecret,{expiresIn: '1h' })
    };
  }

  log(type, data) {
    console.error(data);
    this.logger.log(type, data);
  }
}
