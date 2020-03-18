import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Data } from 'src/data/data.model';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
  constructor(@InjectModel('Data') private readonly dm: Model<Data>) {}

  async setAvailability(
    dayTimestamp: string,
    available: boolean,
  ): Promise<boolean> {
    const filter = { dayTimestamp };
    const update = { available };
    let dayTimestampDB = await this.dm.findOneAndUpdate(filter, update);
    if (dayTimestampDB) {
      return true;
    }
    return false;
  }
}
