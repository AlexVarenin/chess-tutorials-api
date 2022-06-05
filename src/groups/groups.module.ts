import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupLessonSchema, GroupSchema, GroupStudentSchema } from './group.model';
import { GroupController } from './controllers/group/group.controller';
import { GroupService } from './services/group/group.service';
import { LessonSchema } from '../lessons/lesson.model';
import { UserSchema } from '../users/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Group', schema: GroupSchema },
      { name: 'Lesson', schema: LessonSchema },
      { name: 'GroupStudent', schema: GroupStudentSchema },
      { name: 'GroupLesson', schema: GroupLessonSchema },
      { name: 'User', schema: UserSchema }
    ])
  ],
  providers: [
    {
      provide: 'GROUP_SERVICE',
      useClass: GroupService
    }
  ],
  exports: [
    {
      provide: 'GROUP_SERVICE',
      useClass: GroupService
    }
  ],
  controllers: [GroupController]
})
export class GroupsModule {}
