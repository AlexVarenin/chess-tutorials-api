import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { Group, GroupInfo, GroupLesson, GroupStudent, ListGroup } from '../../group.model';
import { IGroupService } from './group';
import { Lesson, LessonInfo } from '../../../lessons/lesson.model';
import { Student, User } from '../../../users/user.model';

@Injectable()
export class GroupService implements IGroupService {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<Group>,
    @InjectModel('Lesson') private readonly lessonModel: Model<LessonInfo>,
    @InjectModel('GroupStudent') private readonly groupStudentModel: Model<GroupStudent>,
    @InjectModel('GroupLesson') private readonly groupLessonModel: Model<GroupLesson>,
    @InjectModel('User') private readonly userModel: Model<User>
  ) {
  }

  async findAll(): Promise<Omit<ListGroup, 'students'>[]> {
    const groups = await this.groupModel.find().exec();
    return groups.map((group: Group)=> this.normaliseAllListGroup(group));
  }

  async findMyGroups(tutorId: string): Promise<ListGroup[]> {
    const groups = await this.groupModel.find({ tutorId });
    const asyncGroups = groups.map((group: Group) => this.normaliseListGroup(group));
    return await Promise.all(asyncGroups);
  }

  async findStudentGroups(studentId: string): Promise<ListGroup[]> {
    const groupStudents = await this.groupStudentModel.find({ studentId });
    const groups = await this.groupModel.find().where('_id').in(groupStudents.map(gs => gs.groupId));
    const asyncGroups = groups.map((group: Group) => this.normaliseListGroup(group));
    return await Promise.all(asyncGroups);
  }

  async findById(id: string): Promise<GroupInfo | undefined> {
    const group = await this.groupModel.findById(id);
    if (!group) {
      throw new NotFoundException('Could not find group');
    }
    const groupLessons = await this.groupLessonModel.find({ groupId: group.id });
    const lessons = await this.lessonModel.find().where('_id').in(groupLessons.map(gs => gs.lessonId));

    const groupStudents = await this.groupStudentModel.find({ groupId: group.id });
    const students = await this.userModel.find().where('_id').in(groupStudents.map(gs => gs.studentId));

    return this.normaliseGroupInfo(
      group,
      lessons.map((lesson => this.normaliseLesson(lesson))),
      students.map(user => this.normaliseApiUser(user as Student))
    );
  }

  async createGroup(group: Group): Promise<string> {
    const newLesson = new this.groupModel({ ...group });
    const result = await newLesson.save();
    return result.id;
  }

  async updateGroup(id: string, patch: Omit<Group, 'tutorId'>): Promise<ListGroup> {
    const group = await this.groupModel.findById(id);
    const { name } = patch;
    if (name) {
      group.name = name;
    }

    await (group as Document).save();
    return this.normaliseListGroup(group);
  }

  async removeGroup(id: string): Promise<void> {
    await this.groupModel.deleteOne({ _id: id }).exec();
    await this.groupLessonModel.deleteMany({ groupId: id }).exec();
    await this.groupLessonModel.deleteMany({ groupId: id }).exec();
  }

  async addLesson(groupId: string, lessonId: string): Promise<string> {
    const newGroupLesson = new this.groupLessonModel({ groupId, lessonId });
    const result = await newGroupLesson.save();
    return result.id;
  }

  async removeLesson(groupId: string, lessonId: string): Promise<void> {
    await this.groupLessonModel.deleteOne({ groupId, lessonId }).exec();
  }

  async addStudent(groupId: string, studentId: string): Promise<string> {
    const newGroupStudent = new this.groupStudentModel({ groupId, studentId });
    const result = await newGroupStudent.save();
    return result.id;
  }

  async removeStudent(groupId: string, studentId: string): Promise<void> {
    await this.groupStudentModel.deleteOne({ groupId, studentId }).exec();
  }

  private normaliseGroupInfo(group: Group, lessons: Lesson[], students: Student[]): GroupInfo {
    const { id, name, tutorId } = group;
    return { id, name, tutorId, students, lessons };
  }

  private async normaliseListGroup(group: Group): Promise<ListGroup> {
    const groupStudents = await this.groupStudentModel.find({ groupId: group.id });
    const students = await this.userModel.find().where('_id').in(groupStudents.map(gs => gs.studentId));

    const { id, name, tutorId } = group;
    return { id, name, tutorId, students: students.map(user => this.normaliseApiUser(user as Student)) };
  }

  private normaliseAllListGroup(group: Group): Omit<ListGroup, 'students'> {
    const { id, name, tutorId } = group;
    return { id, name, tutorId };
  }

  private normaliseLesson(lesson: LessonInfo) {
    const { id, title, description, initialState, orientation, tutorId } = lesson;
    return { id, title, description, initialState, orientation, tutorId };
  }

  private normaliseApiUser(user: Student) {
    const { id, email, role, firstName, lastName, tutorId  } = user;
    return { id, email, role, firstName, lastName, tutorId };
  }
}
