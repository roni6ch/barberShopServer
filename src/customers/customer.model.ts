import * as mongoose from 'mongoose';

export const CustomerSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    haircut: { type: String, required: true },
    gender: { type: String, required: true },
    date: { type: String, required: true },
    hour: { type: String, required: true },
    other: { type: String }
}, { collection: 'customers' })

export interface Customer extends mongoose.Document {
  id:string;
  name: string;
  phone: string;
  haircut: string;
  gender: string;
  date: string;
  hour: string;
  other: string;
}