import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lp } from './lp.model';

@Injectable()
export class LpService {
  
  constructor(
    @InjectModel('Lp') private readonly lpm: Model<Lp>
  ) {
  }
  async getI18n(){
    try {
      let res = await this.lpm.find().exec();
      console.log(res);
      if (res) {return res[0].i18n;}
    } catch (error) {
      return new HttpException(
        'ExceptionFailed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
}
