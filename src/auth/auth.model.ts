import * as mongoose from 'mongoose';

export const AuthSchema = new mongoose.Schema({
  username: { type: String, required: true },
    password: { type: String, required: true },
    host: { type: String, required: true },
    
}, { collection: 'auth' })

export interface Auth extends mongoose.Document {
  username:string;
  password: string;
  host: string;
}