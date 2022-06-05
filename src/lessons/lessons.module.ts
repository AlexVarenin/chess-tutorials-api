import { Module } from '@nestjs/common';
import { LessonService } from './services/lesson/lesson.service';
import { LessonController } from './controllers/lesson/lesson.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonSchema } from './lesson.model';
import { GroupLessonSchema, GroupStudentSchema } from '../groups/group.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Lesson', schema: LessonSchema },
      { name: 'GroupLesson', schema: GroupLessonSchema },
      { name: 'GroupStudent', schema: GroupStudentSchema },
    ])
  ],
  providers: [
    {
      provide: 'LESSON_SERVICE',
      useClass: LessonService
    }
  ],
  exports: [
    {
      provide: 'LESSON_SERVICE',
      useClass: LessonService
    }
  ],
  controllers: [LessonController]
})
export class LessonsModule {}
