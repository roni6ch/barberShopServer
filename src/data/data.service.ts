import { Injectable } from '@nestjs/common';
import { Data } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DataService {
  private data: Data[] = [];

  constructor(@InjectModel('Data') private readonly dm: Model<Data>) {}

  async getData() {
    return await this.dm.find();
  }
  async setHour(data){
     let res = await this.dm.findOne({ dayTimestamp: +data.date }).exec();
     if (res) {
       let resArr = res.hours.map(async (v,i)=>{
            if(v.hour === data.hour){
              res.hours[i].available = false;
              await res.save();
                console.log("found hour in data and updated!!!");
            }
        });
        if (resArr.length > 0){
            return true;
        }
      }
      console.log("didnt find hour in data");
      return false;
  }

  async setAvailability(
    dayTimestamp: string,
    available: boolean,
  ): Promise<boolean> {
    const dayTimestampDB = await this.dm
      .findOne({ dayTimestamp })
      .exec();
    console.log(dayTimestampDB);
    return dayTimestampDB;
  }
}
