import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema({
  calendar: { type: {} },
  owner: { type: {} },
  personals: { type: Array },
  treatmentTimes: { type: Array },
  mail: { type: {} },
  gallery: { type: Array },
  galleryDisplay : { type: String },
  instagramLink : { type: String },
  i18n : { type: {} }
}, { collection: 'settings' })

export interface Settings extends mongoose.Document {
  calendar: Calendar;
  owner: Owner;
  personals: Personals[];
  treatmentTimes: string[];
  mail: string;
  gallery: string[];
  galleryDisplay : string;
  instagramLink : string;
  i18n: {};
}

 interface Calendar {
  timeSpacing:string;
  days : Day[];
  daysOff : DaysOff[];
  slides: number;
  calendarSize: number;
  showPrices: boolean;
  showTimes: boolean;
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
  time: string;
}
