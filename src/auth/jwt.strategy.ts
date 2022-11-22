import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthenticatedUser } from '../user/models/user.model';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    const userFilter = {
      phoneNumber: payload.phoneNumber,
      id: payload.userId,
      roles: payload.roles,
    };
    await this.userService.getUserBy(userFilter, true, false);
    return {
      phoneNumber: payload.phoneNumber,
      userId: payload.userId,
      roles: payload.roles,
    };
  }
}
