import { Injectable } from '@nestjs/common';
import { Data } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as SETTINGS from '../settings/settings.json';

@Injectable()
export class DataService {
  private data: Data[] = [];

  constructor(@InjectModel('Data') private readonly dm: Model<Data>) {}

  async getData() {
    return await this.dm.find();
  }
  async setHour(data){
     let res = await this.dm.findOne({ dayTimestamp: +data.date });
     if (res) {
       let resHours = res.hours.map((v,i)=>{
            if(v.hour === data.hour){
              v.available = false;
            }
            return v;
        });
        if (resHours.length > 0){
          res.hours = resHours;
            await this.dm.updateOne(res, { multi: false });
            console.log('updated');
            return true;
        }else{
          console.log("ERROR - didnt find hour in data");}
      }else{
        console.log("new day -> create one");
        this.addCalendarDay(data);
      }
      return false;
  }
  async addCalendarDay(data) {
    let hours = [];
    for (let h = SETTINGS.calendar.hours[0]; h < SETTINGS.calendar.hours[1];) {
      hours.push({hour:`${h}:00`,available:data.hour!==`${h}:00`?true:false});
      hours.push({hour:`${h}:30`,available:data.hour!==`${h}:30`?true:false});
      h++;
    }
    const newCalendarDay = new this.dm({
      dayTimestamp: data.date,
      available: true,
      hours
    });
    const result = await newCalendarDay.save();
    return result;
  }
}
