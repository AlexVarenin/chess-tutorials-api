import * as mongoose from 'mongoose';

export enum MoveStatus {
  SUCCEED = 'SUCCEED',
  FAILED = 'FAILED',
  FINISHED = 'FINISHED'
}

export const MoveSchema = new mongoose.Schema({
  piece: { type: String, required: true },
  notation: { type: String, required: true },
  fen: { type: String, required: true },
});

export const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  initialState: { type: String, required: true },
  orientation: { type: String, required: true },
  moves: { type: [MoveSchema], required: true },
  notationType: { type: String, required: true },
  disableDrag: { type: Boolean, required: true },
  tutorId: { type: String, required: true }
});

export interface LessonInfo {
  id: string;
  title: string;
  description: string;
  initialState: string;
  orientation: 'black' | 'white';
  moves: Move[];
  notationType: 'cyr' | 'lat';
  disableDrag: boolean;
  tutorId: string;
}

export type Lesson = Omit<LessonInfo, 'description' | 'moves' | 'notationType' | 'disableDrag'>

export interface Move {
  piece: string;
  notation: string;
  fen: string;
}

export interface MoveStatusResponse {
  status: MoveStatus;
  nextMove?: Move;
}
