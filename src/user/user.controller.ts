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
import { UserModel } from './models/user.model';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('user')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Roles(Role.Admin)
  public async getUsers(@Query() query) {
    const name = query.name;
    return await this.userService.getUsers(name);
  }

  @Post()
  @Roles(Role.Admin)
  public createUser(@Body() user: UserModel) {
    return this.userService.createUser(user);
  }

  @Get(':id')
  @Roles(Role.Admin)
  public async getUserById(@Param('id') id: string) {
    return id;
  }

  @Put(':id')
  @Roles(Role.Admin)
  public async updateUser(@Param('id') id: string) {
    return id;
  }
}
