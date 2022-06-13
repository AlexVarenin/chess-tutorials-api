import { Lesson, LessonInfo, Move, MoveStatusResponse } from '../../lesson.model';

export interface ILessonService {
  findById(id: string): Promise<LessonInfo | undefined>;
  findAll(): Promise<Lesson[]>;
  findMyLessons(tutorId: string): Promise<Lesson[]>;
  findStudentLessons(studentId: string): Promise<Lesson[]>;
  createLesson(lesson: LessonInfo): Promise<string>;
  removeLesson(id: string): Promise<void>;
  updateLesson(id: string, patch: Partial<LessonInfo>): Promise<LessonInfo>
  checkMove(id: string, moveIndex: number, move: Move, userId: string): Promise<MoveStatusResponse>
}
