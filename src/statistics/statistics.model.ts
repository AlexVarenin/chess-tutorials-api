import * as mongoose from 'mongoose';

export const LessonStatisticSchema = new mongoose.Schema({
  lessonId: { type: String, required: true },
  studentId: { type: String, required: true },
  tutorId: { type: String, required: true },
  failures: { type: Number, required: true, default: 0 },
  progress: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export interface LessonStatistics {
  id: string;
  lessonId: string;
  studentId: string;
  failures: number;
  tutorId: string;
  progress: number;
  createdAt: string;
}
