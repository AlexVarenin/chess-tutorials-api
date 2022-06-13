import { Module } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/user/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.model';
import { GroupSchema, GroupStudentSchema } from '../groups/group.model';
import { LessonStatisticSchema } from '../statistics/statistics.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Group', schema: GroupSchema },
      { name: 'GroupStudent', schema: GroupStudentSchema },
      { name: 'LessonStatistics', schema: LessonStatisticSchema }
    ])
  ],
  providers: [
    {
      provide: 'USER_SERVICE',
      useClass: UserService
    }
  ],
  exports: [
    {
      provide: 'USER_SERVICE',
      useClass: UserService
    }
  ],
  controllers: [UserController]
})
export class UsersModule {}
