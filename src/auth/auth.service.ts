import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../user/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phoneNumber: string, authCode: number): Promise<any> {
    const user = await this.userService.getUserBy(
      { phoneNumber: phoneNumber },
      true,
      false,
    );
    if (!user) {
      return null;
    }
    const auth = await this.userService.getAuthCode(phoneNumber);
    if (!auth) {
      return null;
    }
    if (auth.code != authCode) {
      return null;
    }
    return user;
  }

  async expireAuthCode(phoneNumber: string): Promise<any> {
    await this.userService.expireAuthCode(phoneNumber);
  }

  async login(user: UserModel) {
    const payload = {
      phoneNumber: user.phoneNumber,
      userId: user.id,
      roles: user.roles,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
