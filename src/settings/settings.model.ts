import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema({
  calendar: { type: {} },
  owner: { type: {} },
  personals: { type: Array },
  treatmentTimes: { type: Array },
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
  gallery: Image[];
  galleryDisplay : string;
  instagramLink : string;
  i18n: {};
}

 interface Calendar {
  timeSpacing:string;
  days : Day[];
  daysOff : DaysOff[];
  holidays: Day[];
  slides: number;
  calendarSize: number;
  showPrices: boolean;
  showTimes: boolean;
}
interface Image {
  id:string;
  url:string;
}


 interface Day {
  day: string;
  hours: string[];
  active: boolean;
}

interface DaysOff {
  dateStr: string;
  timestamp: string;
}

 interface Owner {
  phone: string;
  phone2: string;
  BGColor: string;
  mail: string;
  location: string;
  website: string;
  description:string;
  logo: string;
  video: string;
  BG: string;
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
