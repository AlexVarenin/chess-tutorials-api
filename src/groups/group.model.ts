import * as mongoose from 'mongoose';
import { Lesson } from '../lessons/lesson.model';
import { Student } from '../users/user.model';

export const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tutorId: { type: String, required: true },
});

export const GroupStudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  groupId: { type: String, required: true }
});

export const GroupLessonSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  groupId: { type: String, required: true }
});

export interface Group {
  id: string;
  name: string;
  tutorId: string
}

export interface GroupStudent {
  id: string;
  studentId: string;
  groupId: string;
}

export interface GroupLesson {
  id: string;
  lessonId: string;
  groupId: string;
}

export interface ListGroup extends Group {
  students: Student[];
}

export interface GroupInfo extends ListGroup {
  lessons: Lesson[];
}
