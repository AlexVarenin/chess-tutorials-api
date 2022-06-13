import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserService } from './user';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, User, UserDB } from '../../user.model';
import { Group, GroupStudent } from '../../../groups/group.model';
import { LessonStatistics } from '../../../statistics/statistics.model';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDB>,
    @InjectModel('Group') private readonly groupModel: Model<Group>,
    @InjectModel('GroupStudent') private readonly groupStudentModel: Model<GroupStudent>,
    @InjectModel('LessonStatistics') private readonly lessonStatisticsModel: Model<LessonStatistics>
  ) {

  }

  async findOne(email: string): Promise<UserDB | undefined> {
    return await this.userModel.findOne({ email });
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return users.map((user: UserDB)=> this.normaliseApiUser(user));
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Could not find user');
    }
    return this.normaliseApiUser(user);
  }

  async findStudents(tutorId: string): Promise<Student[]> {
    const users = await this.userModel.find({ tutorId }).exec();
    const asyncUsers = users.map((user: UserDB) => this.normaliseStudent(user as Student));
    return await Promise.all(asyncUsers);
  }

  async createUser(user: UserDB): Promise<string> {
    const { email, password, role, firstName, lastName, tutorId } = user;
    const newUser = new this.userModel({ email, role, password, firstName, lastName, tutorId });
    const result = await newUser.save();
    return result.id;
  }

  async removeStudent(id: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (user && user.role === 'student') {
      await this.userModel.deleteOne({ _id: id }).exec();
      await this.groupStudentModel.deleteMany({ studentId: id }).exec();
      await this.lessonStatisticsModel.deleteMany({ studentId: id }).exec();
    }
  }

  private normaliseApiUser(user: UserDB) {
    const { id, email, role, firstName, lastName, tutorId  } = user;
    return { id, email, role, firstName, lastName, tutorId };
  }

  private async normaliseStudent(user: Student): Promise<Student> {
    const groupStudents = await this.groupStudentModel.find({ studentId: user.id });
    const groups = await this.groupModel.find().where('_id').in(groupStudents.map(gs => gs.groupId));
    const { id, email, role, firstName, lastName, tutorId  } = user;
    return { id, email, role, firstName, lastName, tutorId, groups: groups
        .map(group => this.normaliseGroup(group)) };
  }

  private normaliseGroup(group: Group): Group {
    const { id, name, tutorId } = group;
    return { id, name, tutorId };
  }
}
