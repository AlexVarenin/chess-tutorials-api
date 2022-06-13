import { Student, User, UserDB } from '../../user.model';

export interface IUserService {
  findOne(email: string): Promise<UserDB | undefined>;
  findById(id: string): Promise<User | undefined>;
  findAll(): Promise<User[]>;
  findStudents(tutorId: string): Promise<Student[]>;
  createUser(user: UserDB): Promise<string>;
  removeStudent(id: string): Promise<void>
}

