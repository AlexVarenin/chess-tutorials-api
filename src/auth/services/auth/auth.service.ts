import { AuthenticationProvider } from './auth';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IUserService, } from '../../../users/services/user/user';
import * as bcrypt from 'bcrypt';
import { User, UserDB } from '../../../users/user.model';

@Injectable()
export class AuthService implements AuthenticationProvider {
  constructor(
    @Inject('USER_SERVICE') private readonly usersService: IUserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<User> {
    const user = await this.usersService.findOne(username);

    if (user && await bcrypt.compare(pass, user.password)) {
      const { id, email, role, firstName, lastName, tutorId } = user;
      return { id, email, role, firstName, lastName, tutorId };
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload)
    };
  }

  async register(user: UserDB) {
    const { email } = user;
    if (!!await this.usersService.findOne(email)) {
      throw new ConflictException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(user.password, salt);
    return await this.usersService.createUser({ ...user, password });
  }
}
