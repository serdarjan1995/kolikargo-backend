import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserModelAdmin, UserModel } from './models/user.model';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AppConfigService } from './appConfig.service';
import { AppConfigModel } from './models/appConfig.model';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('user')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Roles(Role.Admin)
  public async getUsers(@Query() query) {
    const name = query.name;
    return await this.userService.getUsers(name, false);
  }

  @Post()
  @Roles(Role.Admin)
  public createUser(@Body() user: CreateUserModelAdmin) {
    return this.userService.createUser(user, user?.roles);
  }

  @Get(':id')
  @Roles(Role.Admin)
  public async getUserById(@Param('id') id: string) {
    return await this.userService.getUserBy({ id: id }, true, false);
  }

  @Put(':id')
  @Roles(Role.Admin)
  public async updateUser(
    @Param('id') id: string,
    @Body() updateParams: CreateUserModelAdmin,
  ) {
    return await this.userService.updateUserDetailsAdmin(
      id,
      updateParams,
      false,
    );
  }
}

@Controller('app-config')
@ApiTags('app-config')
export class AppConfigController {
  constructor(private appConfigService: AppConfigService) {}

  @Get()
  public async getAppConfig() {
    return await this.appConfigService.getAppConfig();
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  public async updateAppConfig(@Body() appConfig: AppConfigModel) {
    return await this.appConfigService.updateAppConfig(appConfig);
  }
}
