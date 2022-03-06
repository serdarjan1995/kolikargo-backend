import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserLogin {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsNumber()
  code: number;
}

export class UserRegister {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  surname: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

export class RequestCode {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phoneNumber: string, authCode: number): Promise<any> {
    const user = await this.userService.getUserBy({ phoneNumber: phoneNumber });
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

  async login(user: UserLogin) {
    const payload = { phoneNumber: user.phoneNumber };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
