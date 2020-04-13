import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema({
  calendar: { type: {} },
  owner: { type: {} },
  personals: { type: Array },
  mail: { type: {} },
  gallery: { type: Array },
  galleryDisplay : { type: String },
  instagramLink : { type: String }
}, { collection: 'settings' })

export interface Settings extends mongoose.Document {
  calendar: Calendar;
  owner: Owner;
  personals: Personals[];
  mail: string;
  gallery: string[];
  galleryDisplay : string;
  instagramLink : string;
}

 interface Calendar {
  halfTime:boolean;
  days : Day[];
  daysOff : DaysOff[];
  slides: number;
  hours: number[];
  mail: string;
  website: string;
  location: string;
  title: string;
  info: string;
}

 interface Day {
  day: string;
  hours: string[];
  active: boolean;
}

interface DaysOff {
  day: string;
  numDay: string;
  month: string;
  year: string;
  timestamp: string;
}

 interface Owner {
  phone: string;
  whatsapp: string;
}
interface Personals {
  gender: string;
  active: boolean;
  treatments: peronalTreatments[];
}

interface peronalTreatments {
  treatment: string;
  price: string;
}
