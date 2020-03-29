import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  username: { type: String, required: true },
    password: { type: String, required: true },
}, { collection: 'users' })

export interface User extends mongoose.Document {
  username:string;
  password: string;
}