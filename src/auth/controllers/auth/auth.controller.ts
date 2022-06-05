import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticationProvider } from '../../services/auth/auth';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { UserDB } from '../../../users/user.model';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authService: AuthenticationProvider) {}
  /**
  * GET /api/auth/login
  * This is the route the user will visit to authenticate
  */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    return await this.authService.login(req.user);
  }

  @Post('register')
  async createUser(@Body() { user }: { user: UserDB }) {
    const generatedId = await this.authService.register(user);
    return { id: generatedId };
  }
}
