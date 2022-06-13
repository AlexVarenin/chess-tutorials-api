import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LessonStatistics } from '../../statistics.model';
import { IStatisticsService } from './statistics';
import { Student, UserDB } from '../../../users/user.model';

@Injectable()
export class StatisticsService implements IStatisticsService {
  constructor(
    @InjectModel('LessonStatistics') private readonly lessonStatisticsModel: Model<LessonStatistics>,
    @InjectModel('User') private readonly userModel: Model<UserDB>
  ) {

  }

  async getAllByTutor(tutorId: string): Promise<LessonStatistics[]> {
    const statistics = await this.lessonStatisticsModel.find({ tutorId }).sort({ createdAt: -1 }).exec();
    return statistics.map((statistics: LessonStatistics)=> this.normaliseStatistics(statistics));
  }

  async findCompletedByStudent(studentId: string): Promise<LessonStatistics[]> {
    const statistics = await this.lessonStatisticsModel.find({ studentId, progress: 100 }).exec();
    return statistics.map((statistics: LessonStatistics) => this.normaliseStatistics(statistics));
  }

  async createNewRecord(lessonId: string, studentId: string): Promise<string> {
    const { tutorId } = await this.userModel.findById(studentId).exec() as unknown as Student;
    if (!!tutorId) {
      const newLessonStatistics = new this.lessonStatisticsModel({ lessonId, studentId, tutorId });
      const result = await newLessonStatistics.save();
      return result.id;
    }
    throw new BadRequestException('Tutor is not find for given user');
  }

  private normaliseStatistics(statistics: LessonStatistics) {
    const { id, studentId, lessonId, failures, tutorId, progress, createdAt } = statistics;
    return { id, studentId, lessonId, failures, tutorId, progress, createdAt };
  }
}
