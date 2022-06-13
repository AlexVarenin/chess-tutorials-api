import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ILessonService } from '../../services/lesson/lesson';
import { LessonInfo, Move } from '../../lesson.model';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonController {
  constructor(@Inject('LESSON_SERVICE') private readonly lessonService: ILessonService) {}

  @Get('')
  async findAll() {
    return await this.lessonService.findAll();
  }

  @Post('')
  async createLesson(@Body() lesson: Omit<LessonInfo, 'tutorId'>, @Req() req) {
    const newLesson = { ...lesson, tutorId: req.user.id };
    const generatedId = await this.lessonService.createLesson(newLesson);
    return { id: generatedId };
  }

  @Get('my')
  async findMyLessons(@Req() req) {
    return await this.lessonService.findMyLessons(req.user.id);
  }

  @Get('student')
  async findStudentLessons(@Req() req) {
    return await this.lessonService.findStudentLessons(req.user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.lessonService.findById(id);
  }

  @Delete(':id')
  async removeLesson(@Param('id') id: string) {
    await this.lessonService.removeLesson(id);
  }

  @Patch(':id')
  async updateLesson(@Param('id') id: string, @Body() lesson: Partial<LessonInfo>) {
    return await this.lessonService.updateLesson(id, lesson);
  }

  @Post(':id/check-move/:moveIndex')
  async checkMove(
    @Req() req,
    @Param('id') id: string,
    @Param('moveIndex') moveIndex: number,
    @Body() move: Move
  ) {
    return await this.lessonService.checkMove(id, moveIndex, move, req.user.id);
  }

}
