import { Module } from '@nestjs/common';
import { StatisticsService } from './services/statistics/statistics.service';
import { StatisticsController } from './controllers/statistics/statistics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonStatisticSchema } from './statistics.model';
import { UserSchema } from '../users/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'LessonStatistics', schema: LessonStatisticSchema },
      { name: 'User', schema: UserSchema }
    ])
  ],
  providers: [
    {
      provide: 'STATISTICS_SERVICE',
      useClass: StatisticsService
    }
  ],
  exports: [
    {
      provide: 'STATISTICS_SERVICE',
      useClass: StatisticsService
    }
  ],
  controllers: [StatisticsController]
})
export class StatisticsModule {}
