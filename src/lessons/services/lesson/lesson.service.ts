import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, HydratedDocument } from 'mongoose';
import {
  Lesson,
  LessonInfo,
  Move,
  MoveStatus,
  MoveStatusResponse,
} from '../../lesson.model';
import { ILessonService } from './lesson';
import { GroupLesson, GroupStudent } from '../../../groups/group.model';
import { LessonStatistics } from '../../../statistics/statistics.model';

@Injectable()
export class LessonService implements ILessonService {
  constructor(
    @InjectModel('Lesson') private readonly lessonModel: Model<LessonInfo>,
    @InjectModel('GroupStudent') private readonly groupStudentModel: Model<GroupStudent>,
    @InjectModel('GroupLesson') private readonly groupLessonModel: Model<GroupLesson>,
    @InjectModel('LessonStatistics') private readonly lessonStatisticsModel: Model<LessonStatistics>
  ) {

  }

  async findAll(): Promise<Lesson[]> {
    const users = await this.lessonModel.find().exec();
    return users.map((lesson: LessonInfo)=> this.normaliseLesson(lesson));
  }

  async findMyLessons(tutorId: string): Promise<Lesson[]> {
    const lessons = await this.lessonModel.find({ tutorId }).exec();
    return lessons.map((lesson: LessonInfo)=> this.normaliseLesson(lesson)) as Lesson[];
  }

  async findStudentLessons(studentId: string): Promise<Lesson[]> {
    const groupStudents = await this.groupStudentModel.find({ studentId });
    const groupLessons = await this.groupLessonModel.find().where('groupId').in(groupStudents.map(gs => gs.groupId));
    const lessons = await this.lessonModel.find().where('_id').in(groupLessons.map(gl => gl.lessonId));
    return lessons.map((lesson: LessonInfo)=> this.normaliseLesson(lesson)) as Lesson[];
  }

  async findById(id: string): Promise<LessonInfo | undefined> {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) {
      throw new NotFoundException('Could not find lesson');
    }
    return this.normaliseLessonInfo(lesson);
  }

  async createLesson(lesson: LessonInfo): Promise<string> {
    const newLesson = new this.lessonModel({ ...lesson });
    const result = await newLesson.save();
    return result.id;
  }

  async removeLesson(id: string): Promise<void> {
    await this.lessonModel.deleteOne({ _id: id }).exec();
    await this.groupLessonModel.deleteMany({ lessonId: id }).exec();
    await this.lessonStatisticsModel.deleteMany({ lessonId: id }).exec();
  }

  async updateLesson(id: string, patch: Partial<LessonInfo>): Promise<LessonInfo> {
    const lesson = await this.lessonModel.findById(id);
    const { title, description, initialState, orientation, moves, notationType, disableDrag } = patch;
    if (title) {
      lesson.title = title;
    }
    if (description) {
      lesson.description = description;
    }
    if (initialState) {
      lesson.initialState = initialState;
    }
    if (orientation) {
      lesson.orientation = orientation;
    }
    if (moves) {
      lesson.moves = moves;
    }
    if (notationType) {
      lesson.notationType = notationType;
    }
    if (disableDrag === true || disableDrag === false) {
      lesson.disableDrag = disableDrag;
    }

    await (lesson as Document).save();
    return this.normaliseLessonInfo(lesson);
  }

  async checkMove(id: string, moveIndex: number, move: Move, userId: string): Promise<MoveStatusResponse> {
    const { moves, disableDrag } = await this.lessonModel.findById(id);

    if (moveIndex >= moves.length) {
      return { status: MoveStatus.FINISHED };
    }

    const lessonStatistics = await this.findLastRecord(id, userId);

    const currentMove = moves[moveIndex];
    if (currentMove.fen === move.fen && (!disableDrag || move.notation === currentMove.notation)) {
      const nextMove = moves[++moveIndex];
      if (nextMove) {

        await this.updateProgress(lessonStatistics, moveIndex, moves);

        return { status: MoveStatus.SUCCEED, nextMove };
      }

      await this.updateProgress(lessonStatistics, moveIndex, moves);

      return { status: MoveStatus.FINISHED };
    }

    await this.updateFailures(lessonStatistics);

    return { status: MoveStatus.FAILED }
  }

  private normaliseLessonInfo(lesson: LessonInfo) {
    const { id, title, description, initialState, orientation, moves, notationType, disableDrag, tutorId  } = lesson;
    return { id, title, description, initialState, orientation, moves, notationType, disableDrag, tutorId };
  }

  private normaliseLesson(lesson: LessonInfo) {
    const { id, title, initialState, orientation, tutorId } = lesson;
    return { id, title, initialState, orientation, tutorId };
  }

  private async findLastRecord(lessonId: string, studentId: string) {
    return (await this.lessonStatisticsModel
        .find({ lessonId, studentId })
        .sort({ createdAt: -1 })
        .limit(1)
    )[0];
  }

  private async updateProgress(record: HydratedDocument<LessonStatistics>, moveIndex: number, moves: Move[]) {
    if (!!record) {
      record.progress = Math.floor(moveIndex / moves.length * 100);
      await (record as Document).save();
    }
  }

  private async updateFailures(record: HydratedDocument<LessonStatistics>) {
    if (!!record) {
      record.failures = ++record.failures;
      await (record as Document).save();
    }
  }
}
