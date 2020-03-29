import * as mongoose from 'mongoose';

export const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true }
}, { collection: 'admins' })

export interface Admin extends mongoose.Document {
  username:string;
}