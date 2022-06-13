import { LessonStatistics } from '../../statistics.model';

export interface IStatisticsService {
  getAllByTutor(tutorId: string): Promise<LessonStatistics[]>;
  findCompletedByStudent(studentId: string): Promise<LessonStatistics[]>
  createNewRecord(lessonId: string, studentId: string): Promise<string>;
}
