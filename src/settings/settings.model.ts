import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema({
  calendar: { type: {} },
  owner: { type: {} },
  treatments: { type: Array },
  mail: { type: {} },
  gallery: { type: Array },
  galleryDisplay : { type: String },
  instagramLink : { type: String }
}, { collection: 'settings' })

export interface Settings extends mongoose.Document {
  calendar: Calendar;
  owner: Owner;
  treatments: string[];
  mail: string;
  gallery: string[];
  galleryDisplay : string;
  instagramLink : string;
}

export interface Calendar {
  daysOff: string[];
  slides: number;
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