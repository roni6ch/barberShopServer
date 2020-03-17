import { Injectable } from '@nestjs/common';
import { Data } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DataService {
  private data: Data[] = [];

  constructor(@InjectModel('Data') private readonly dataModel: Model<Data>) {}

  async getData() {
      console.log('getData');
    const data = await this.dataModel.find().exec();
    console.log('data',data);
    return data;
  }

  async setAvailability(dayTimestamp: string, available: boolean): Promise<boolean> {
    const dayTimestampDB = await this.dataModel.findOne({ dayTimestamp }).exec();
    console.log(dayTimestampDB);
    return dayTimestampDB;
  }
  
 
}
