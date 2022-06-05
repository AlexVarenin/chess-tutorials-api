import { UserDB } from '../../../users/user.model';

export interface AuthenticationProvider {
  validateUser(username: string, pass: string): Promise<any>
  login(user: any);
  register(user: UserDB): Promise<string>
}

