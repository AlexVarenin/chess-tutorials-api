import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { IGroupService } from '../../services/group/group';
import { Group } from '../../group.model';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(@Inject('GROUP_SERVICE') private readonly groupService: IGroupService) {}

  @Get('')
  async findAll() {
    return await this.groupService.findAll();
  }

  @Post('')
  async createGroup(@Body() group: Group, @Req() req) {
    const newGroup = { ...group, tutorId: req.user.id };
    const generatedId = await this.groupService.createGroup(newGroup);
    return { id: generatedId };
  }

  @Get('student')
  async findStudentGroups(@Req() req) {
    return await this.groupService.findStudentGroups(req.user.id);
  }

  @Get('my')
  async findMyGroups(@Req() req) {
    return await this.groupService.findMyGroups(req.user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.groupService.findById(id);
  }

  @Patch(':id')
  async updateGroup(@Param('id') id: string, @Body() group: Partial<Group>) {
    return await this.groupService.updateGroup(id, group);
  }

  @Delete(':id')
  async removeGroup(@Param('id') id: string) {
    await this.groupService.removeGroup(id);
  }

  @Post(':id/lesson')
  async addLesson(@Param('id') id: string, @Body() { lessonId }: { lessonId: string }) {
    const generatedId = await this.groupService.addLesson(id, lessonId);
    return { id: generatedId };
  }

  @Delete(':id/lesson/:lessonId')
  async removeLesson(
    @Param('id') id: string, @Param('lessonId') lessonId: string) {
    return await this.groupService.removeLesson(id, lessonId);
  }

  @Post(':id/student')
  async addStudent(@Param('id') id: string, @Body() { studentId }: { studentId: string }) {
    const generatedId = await this.groupService.addStudent(id, studentId);
    return { id: generatedId };
  }

  @Delete(':id/student/:studentId')
  async removeStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return await this.groupService.removeStudent(id, studentId);
  }
}
