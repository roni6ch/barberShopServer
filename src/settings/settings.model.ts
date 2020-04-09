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
  treatments: Treatment[];
  mail: string;
  gallery: string[];
  galleryDisplay : string;
  instagramLink : string;
  personals: Personal[];
}

 interface Calendar {
  days : Day[];
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

 interface Owner {
  phone: string;
  whatsapp: string;
}

 interface Personal {
  personal: string;
  active: boolean;
}

interface Treatment {
  gender: string;
  active: boolean;
  treatments: peronalTreatments[];
}

interface peronalTreatments {
  treatment: string;
  price: string;
}
