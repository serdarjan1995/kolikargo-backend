import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { AddressType, CreateUserAddressModel, UserAddressModel } from './models/userAddress.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('user-address')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('user-address')
export class UserAddressController {
  constructor(private userAddressService: UserAddressService) {}

  @Get()
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: UserAddressModel,
    isArray: true,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'filter by address type',
    enum: AddressType,
  })
  public async listUserAddresses(@Query() query, @Request() req) {
    const filter = {};
    if (query?.type) {
      filter['type'] = query?.type;
    }
    return await this.userAddressService.listUserAddresses(
      filter,
      req.user.userId,
    );
  }

  @Post()
  @Roles(Role.User)
  @ApiCreatedResponse({
    description: 'Successful Response',
    type: UserAddressModel,
  })
  public createUserAddress(
    @Request() req,
    @Body() userAddress: CreateUserAddressModel,
  ) {
    return this.userAddressService.createUserAddress(
      userAddress,
      req.user.userId,
    );
  }

  @Get(':id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: UserAddressModel,
  })
  public async getUserAddressById(@Param('id') id: string, @Request() req) {
    return this.userAddressService.getUserAddress(id, req.user.userId);
  }

  @Put(':id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: UserAddressModel,
  })
  public async updateUserAddress(
    @Param('id') id: string,
    @Body() userAddress: UserAddressModel,
    @Request() req,
  ) {
    return this.userAddressService.updateUserAddress(
      id,
      req.user.userId,
      userAddress,
    );
  }

  @Delete(':id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
  })
  public async deleteCargoType(@Param('id') id: string) {
    return this.userAddressService.deleteUserAddress(id);
  }
}
