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
import { AuthService, LoginType } from './auth.service';
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
import { checkNumber } from '../utils';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cargoSupplierService: CargoSupplierService,
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
    checkNumber(reqCode.phoneNumber);

    let user;
    switch (reqCode.type) {
      case LoginType.customer:
        user = await this.userService.getUserBy(
          { phoneNumber: reqCode.phoneNumber },
          true,
          false,
        );
        break;
      case LoginType.supplier:
        user = await this.cargoSupplierService.getCargoSupplierByFilter(
          { phoneNumber: reqCode.phoneNumber },
          true,
          false,
        );
        break;
    }

    const authCode = await this.userService.refreshCode(
      reqCode.phoneNumber,
      user,
      reqCode.type,
    );
    if (!authCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Please wait until previous code expires',
          errorCode: 'login_code_request_throttled',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
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
    checkNumber(req.phoneNumber);

    const user = await this.userService.getUserBy(
      { phoneNumber: req.phoneNumber },
      false,
    );
    if (!user) {
      await this.userService.createUser(req);
    }
    const authCode = await this.userService.refreshCode(
      req.phoneNumber,
      user,
      LoginType.customer,
    );
    if (!authCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Please wait until previous code expires',
          errorCode: 'login_code_request_throttled',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Successful Response',
    type: UserModel,
  })
  async getProfile(@Request() req) {
    switch (req.user.type) {
      case LoginType.customer:
        return await this.userService.getUserBy({ id: req.user.id });
      case LoginType.supplier:
        return await this.cargoSupplierService.getCargoSupplierByFilter(
          { phoneNumber: req.user.phoneNumber },
          true,
          true,
        );
    }
    return null;
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
      req.user.id,
      updateParams.name,
      updateParams.surname,
    );
  }
}
