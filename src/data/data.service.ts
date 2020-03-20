import { Injectable } from '@nestjs/common';
import { Data } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectID } from 'mongodb';

import * as moment from 'moment';
import * as SETTINGS from '../settings/settings.json';
import { Customer } from 'src/customers/customer.model';

@Injectable()
export class DataService {
  private data: Data[] = [];

  constructor(@InjectModel('Data') private readonly dm: Model<Data>) {}

  async deleteAllDocuments() {
    return await this.dm.deleteMany();
  }

  async getData() {
    let calendar = [];
    var weekStart = moment()
      .clone()
      .startOf('week');
    for (let i = 0; i < SETTINGS.calendar.days * 2; i++) {
      let date = +moment(weekStart).add(i, 'days');
      calendar.push(+new Date(date));
    }
    return await this.dm
      .find()
      .where('dayTimestamp')
      .in(calendar)
      .exec();
  }

  async deleteHour(data: Customer) {
    let res = await this.dm.findOne({ dayTimestamp: data.date });
    if (res) {
      let resHours = res.hours.map((v, i) => {
        if (v.hour === data.hour) {
          v.available = true;
        }
        return v;
      });
      res.hours = resHours;
      console.log(res);
      const result = await this.dm
        .updateOne({ _id: res._id }, { hours: resHours })
        .exec();
      if (result.n === 0) {
        console.log('not updated!');
        return false;
      } else {
        console.log('updated!!!');
        return true;
      }
    } else {
      console.log('no res found!');
      return false;
    }
  }

  async setHour(data) {
    let res = await this.dm.findOne({ dayTimestamp: +data.date }).exec();
    if (res) {
      console.log('res found!');
      let resHours = res.hours.map((v, i) => {
        if (v.hour === data.hour) {
          v.available = false;
        }
        return v;
      });
      if (resHours.length > 0) {
        console.log('res length!');
        const result = await this.dm
          .updateOne({ _id: res._id }, { hours: resHours })
          .exec();
        if (result.n === 0) {
          console.log('not updated!');
          return false;
        } else {
          console.log('updated!!!');
          return true;
        }
      } else {
        console.log('no res', res);
      }
      return false;
    }
    this.addCalendarDay(data);
  }
  async addCalendarDay(data) {
    console.log('new day -> create one');
    let hours = [];
    for (let h = SETTINGS.calendar.hours[0]; h < SETTINGS.calendar.hours[1]; ) {
      hours.push({
        hour: `${h}:00`,
        available: data.hour !== `${h}:00` ? true : false,
      });
      hours.push({
        hour: `${h}:30`,
        available: data.hour !== `${h}:30` ? true : false,
      });
      h++;
    }
    const newCalendarDay = new this.dm({
      dayTimestamp: data.date,
      available: true,
      hours,
    });
    const result = await newCalendarDay.save();
    console.log('saved!');
    return result;
  }
}
