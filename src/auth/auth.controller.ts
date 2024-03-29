import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  RequestCode,
  UpdateUserProfileModel,
  UserLogin,
  UserModel,
  UserRegister,
} from '../user/models/user.model';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({
    description: 'Login Successful response',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'Access token' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Login Fail response',
  })
  @ApiBody({
    type: UserLogin,
  })
  public async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('request-code')
  @ApiCreatedResponse({
    description: 'Successful response',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Operation result' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error response',
  })
  public async requestCode(@Body() reqCode: RequestCode) {
    if (!reqCode.phoneNumber) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please provide phoneNumber field',
          errorCode: 'phone_number_missing',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    this.checkNumber(reqCode.phoneNumber);

    const authCode = await this.userService.refreshCode(reqCode.phoneNumber);
    if (!authCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please wait until previous code expires',
          errorCode: 'login_code_request_throttled',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return { success: true };
  }

  @Post('register')
  @ApiCreatedResponse({
    description: 'Successful response',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Operation result' },
      },
    },
  })
  public async register(@Body() req: UserRegister) {
    this.checkNumber(req.phoneNumber);

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
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please wait until previous code expires',
          errorCode: 'login_code_request_throttled',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return { success: true };
  }

  checkNumber(phoneNumber) {
    const regex = /^\+905[0-9]{9}$/g;
    if (!phoneNumber.match(regex)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid number. Should be +905xxxxxxxxx',
          errorCode: 'phone_number_validation_error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Successful Response',
    type: UserModel,
  })
  getProfile(@Request() req) {
    return this.userService.getUserBy({ id: req.user.userId });
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Successful Response',
    type: UserModel,
  })
  updateProfile(@Request() req, @Body() updateParams: UpdateUserProfileModel) {
    return this.userService.updateUser(
      req.user.userId,
      updateParams.name,
      updateParams.surname,
    );
  }
}
