import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, LoginType } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'phoneNumber',
      passwordField: 'authCode',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    phoneNumber: string,
    authCode: number,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let type: LoginType = req.body.type;
    if (!type) {
      // default
      type = LoginType.customer;
    }
    const user = await this.authService.validateUser(
      phoneNumber,
      authCode,
      type,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.authService.expireAuthCode(phoneNumber);
    return { user, type };
  }
}
