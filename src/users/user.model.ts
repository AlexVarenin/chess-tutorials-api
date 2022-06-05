import * as mongoose from 'mongoose';
import { Group } from '../groups/group.model';

export const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  tutorId: { type: String, required: false }
});

export interface UserDB {
  id: string;
  email: string;
  role: 'student' | 'tutor';
  password: string;
  firstName?: string;
  lastName?: string;
  tutorId?: string;
}


export type User = Omit<UserDB, 'password'>

export type Student = Omit<User, 'role' | 'tutorId'> & { role: 'student', tutorId: string, groups?: Group[] };
