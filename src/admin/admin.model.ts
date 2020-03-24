import * as mongoose from 'mongoose';

export const AdminSchema = new mongoose.Schema({
    id: { type: String, required: true },
    admin: { type: String, required: true },
}, { collection: 'admins' })

export interface Admin extends mongoose.Document {
  id:string;
  admin: string;
}