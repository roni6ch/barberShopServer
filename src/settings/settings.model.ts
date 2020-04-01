import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema({
  calendar: { type: {} },
  owner: { type: {} },
  treatments: { type: Array },
  mail: { type: {} },
  gallery: { type: Array }
}, { collection: 'settings' })

export interface Settings extends mongoose.Document {
  calendar: Calendar;
  owner: Owner;
  treatments: string[];
  mail: string;
  gallery: string[];
}

export interface Calendar {
  daysOff: string[];
  days: number;
  hours: number[];
  mail: string;
  website: string;
  location: string;
  title: string;
  info: string;
}

export interface Owner {
  phone: string;
  whatsapp: string;
}

export interface Mail {
  subject: string;
}