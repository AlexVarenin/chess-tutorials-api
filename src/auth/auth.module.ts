import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './services/auth/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth/auth.controller';

@Module({
  controllers: [AuthController],
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.development' }),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '120m' },
    }),
  ],
  providers: [{
    provide: 'AUTH_SERVICE',
    useClass: AuthService
  },
  JwtStrategy,
  LocalStrategy
  ],
  exports: [
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService
    }
  ],
})
export class AuthModule {}
