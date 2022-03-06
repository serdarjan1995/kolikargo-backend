import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'phoneNumber', passwordField: 'authCode' });
  }

  async validate(phoneNumber: string, authCode: number): Promise<any> {
    const user = await this.authService.validateUser(phoneNumber, authCode);
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.authService.expireAuthCode(phoneNumber);
    return user;
  }
}
