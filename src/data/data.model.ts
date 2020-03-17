import * as mongoose from 'mongoose';

export const DataSchema = new mongoose.Schema({
    dayTimestamp: String,
    available: Boolean,
    hours: Array
})

export interface Data {
  dayTimestamp: string;
  available: boolean;
  hours: Hours[];
}
export interface Hours {
  hour: string;
  available: boolean;
}
