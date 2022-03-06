import {
  Body,
  Request,
  Controller,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService, RequestCode, UserRegister } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  public async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('request-code')
  public async requestCode(@Body() reqCode: RequestCode) {
    if (!reqCode.phoneNumber) {
      throw new HttpException(
        'Please provide phoneNumber field',
        HttpStatus.BAD_REQUEST,
      );
    }

    const authCode = await this.userService.refreshCode(reqCode.phoneNumber);
    if (!authCode) {
      throw new HttpException(
        'Please wait until previous code expires',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { success: true };
  }

  @Post('register')
  public async register(@Body() req: UserRegister) {
    const user = await this.userService.getUserBy(
      { phoneNumber: req.phoneNumber },
      false,
    );
    if (!user) {
      await this.userService.createUser(req);
    }
    const authCode = await this.userService.refreshCode(req.phoneNumber);
    if (!authCode) {
      throw new HttpException(
        'Please wait until previous code expires',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
