import * as mongoose from 'mongoose';

export const DataSchema = new mongoose.Schema({
    dayTimestamp: { type: String, required: true },
    available: { type: Boolean, required: true },
    hours: { type: Array, required: true },
    host: { type: String, required: true }
}, { collection: 'data' })

export interface Data extends mongoose.Document {
  dayTimestamp: string;
  available: boolean;
  hours: Hours[];
  host: string;
}
export interface Hours {
  hour: string;
}
