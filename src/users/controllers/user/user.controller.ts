import { Controller, Delete, Get, Inject, Param, Req, UseGuards } from '@nestjs/common';
import { IUserService } from '../../services/user/user';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(@Inject('USER_SERVICE') private readonly userService: IUserService) {}

  @Get('me')
  async getProfile(@Req() req) {
    return await this.userService.findById(req.user.id);
  }

  @Get('')
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('students')
  async findStudents(@Req() req) {
    return await this.userService.findStudents(req.user.id);
  }

  @Delete('students/:id')
  async removeStudent(@Param('id') id: string) {
    await this.userService.removeStudent(id);
  }
}
