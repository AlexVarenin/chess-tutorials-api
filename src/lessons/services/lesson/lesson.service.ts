import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Lesson, LessonInfo, Move, MoveStatus, MoveStatusResponse } from '../../lesson.model';
import { ILessonService } from './lesson';
import { GroupLesson, GroupStudent } from '../../../groups/group.model';

@Injectable()
export class LessonService implements ILessonService {
  constructor(
    @InjectModel('Lesson') private readonly lessonModel: Model<LessonInfo>,
    @InjectModel('GroupStudent') private readonly groupStudentModel: Model<GroupStudent>,
    @InjectModel('GroupLesson') private readonly groupLessonModel: Model<GroupLesson>
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

  async checkMove(id: string, moveIndex: number, move: Move): Promise<MoveStatusResponse> {
    const { moves, disableDrag } = await this.lessonModel.findById(id);
    if (moveIndex >= moves.length) {
      return { status: MoveStatus.FINISHED };
    }
    const currentMove = moves[moveIndex];
    if (currentMove.fen === move.fen && (!disableDrag || move.notation === currentMove.notation)) {
      const nextMove = moves[++moveIndex];
      if (nextMove) {
        return { status: MoveStatus.SUCCEED, nextMove };
      }
      return { status: MoveStatus.FINISHED };
    }
    return { status: MoveStatus.FAILED }
  }

  private normaliseLessonInfo(lesson: LessonInfo) {
    const { id, title, description, initialState, orientation, moves, notationType, disableDrag, tutorId  } = lesson;
    return { id, title, description, initialState, orientation, moves, notationType, disableDrag, tutorId };
  }

  private normaliseLesson(lesson: LessonInfo) {
    const { id, title, description, initialState, orientation, tutorId } = lesson;
    return { id, title, description, initialState, orientation, tutorId };
  }
}
