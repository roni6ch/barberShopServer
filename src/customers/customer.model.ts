import * as mongoose from 'mongoose';

export const CustomerSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    haircut: { type: String, required: true },
    gender: { type: String, required: true },
    date: { type: String, required: true },
    dateStr: { type: String, required: true },
    hour: { type: String, required: true },
    host: { type: String, required: true },
    username: { type: String, required: true },
    treatmentTime : { type: String, required: true },
    lang: { type: String, required: true },
    image: { type: String, required: true },
    cardInfo: { type: String},
    other: { type: String }
}, { collection: 'customers' })

export interface Customer extends mongoose.Document {
  id:string;
  name: string;
  phone: string;
  haircut: string;
  gender: string;
  date: string;
  dateStr: string,
  hour: string;
  host: string;
  username: string;
  treatmentTime: string;
  lang: string;
  other: string;
  cardInfo: string;
  image:string; 
}