import { Group, GroupInfo, ListGroup } from '../../group.model';

export interface IGroupService {
  findById(id: string): Promise<GroupInfo | undefined>;
  findAll(): Promise<Omit<ListGroup, 'students'>[]>
  findMyGroups(tutorId: string): Promise<ListGroup[]>;
  findStudentGroups(studentId: string): Promise<ListGroup[]>;
  createGroup(group: Group): Promise<string>;
  updateGroup(id: string, group: Partial<Group>): Promise<ListGroup>;
  addLesson(id: string, lessonId: string): Promise<string>;
  removeLesson(id: string, lessonId: string): Promise<void>;
  addStudent(id: string, groupId: string): Promise<string>;
  removeStudent(id: string, groupId: string): Promise<void>;
}
