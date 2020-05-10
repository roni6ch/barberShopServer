import * as mongoose from 'mongoose';

export const LpSchema = new mongoose.Schema({
    i18n : { type: {} }
   
}, { collection: 'lp' })

export interface Lp extends mongoose.Document {
    i18n: {};
}