import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { IStatisticsService } from '../../services/statistics/statistics';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(@Inject('STATISTICS_SERVICE') private readonly statisticsService: IStatisticsService) {}

  @Get('')
  async findAllByTutor(@Req() req) {
    return await this.statisticsService.getAllByTutor(req.user.id);
  }

  @Get('completed')
  async findCompletedByStudent(@Req() req) {
    return await this.statisticsService.findCompletedByStudent(req.user.id);
  }

  @Post('')
  async createLessonStatistics(@Body() { lessonId }, @Req() req) {
    const generatedId = await this.statisticsService.createNewRecord(lessonId, req.user.id);
    return { id: generatedId };
  }

}
