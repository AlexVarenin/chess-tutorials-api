import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LessonsModule } from './lessons/lessons.module';
import { GroupsModule } from './groups/groups.module';
import { StatisticsModule } from './statistics/statistics.module';


@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `.env.${process.env.NODE_ENV || 'development'}` }),
    MongooseModule.forRoot( process.env.MONGO_URL),
    UsersModule,
    AuthModule,
    LessonsModule,
    GroupsModule,
    StatisticsModule
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
