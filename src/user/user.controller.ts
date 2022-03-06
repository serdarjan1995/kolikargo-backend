import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserModel } from './models/user.model';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @Get()
  // public async getUsers(@Query() query) {
  //   const name = query.name;
  //   return await this.userService.getUsers(name);
  // }
  //
  // @Post()
  // public createUser(@Body() user: UserModel) {
  //   return this.userService.createUser(user);
  // }
  //
  // @Get(':id')
  // public async getUserById(@Param('id') id: string) {
  //   return id;
  // }
  //
  // @Put(':id')
  // public async updateUser(@Param('id') id: string) {
  //   return id;
  // }
}
