import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema({
  calendar: { type: {} },
  owner: { type: {} },
  treatments: { type: Array },
  mail: { type: {} },
  gallery: { type: Array },
  galleryDisplay : { type: String },
  instagramLink : { type: String },
  personals : { type: Array }
}, { collection: 'settings' })

export interface Settings extends mongoose.Document {
  calendar: Calendar;
  owner: Owner;
  treatments: string[];
  mail: string;
  gallery: string[];
  galleryDisplay : string;
  instagramLink : string;
  personals: Personal[];
}

export interface Calendar {
  daysOff: string[];
  days : Day[];
  slides: number;
  hours: number[];
  mail: string;
  website: string;
  location: string;
  title: string;
  info: string;
}

export interface Day {
  day: string;
  hours: string[];
  active: boolean;
}

export interface Owner {
  phone: string;
  whatsapp: string;
}

export interface Mail {
  subject: string;
}

export interface Personal {
  personal: string;
  active: boolean;
}