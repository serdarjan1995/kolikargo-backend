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
import { CargoTypeService } from './cargo-type.service';
import { CargoTypeModel, CreateCargoTypeModel } from './models/cargoType.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse, ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('cargo-type')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('cargo-type')
export class CargoTypeController {
  constructor(private cargoTypeService: CargoTypeService) {}

  @Get()
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoTypeModel,
    isArray: true,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'filter by name',
  })
  public async getCargoTypes(@Query() query) {
    const name = query.name;
    const filter = {
      name: { $regex: `.*${name}.*`, $options: 'i' },
    };
    return await this.cargoTypeService.getCargoTypes({ filter });
  }

  @Post()
  @Roles(Role.Admin)
  @ApiCreatedResponse({
    description: 'Successful Response',
    type: CargoTypeModel,
  })
  public createCargoType(
    @Request() req,
    @Body() cargoType: CreateCargoTypeModel,
  ) {
    return this.cargoTypeService.createCargoType(cargoType);
  }

  @Get(':id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoTypeModel,
  })
  public async getCargoTypeById(@Param('id') id: string) {
    return this.cargoTypeService.getCargoType(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoTypeModel,
  })
  public async updateCargoType(
    @Param('id') id: string,
    @Body() cargoType: CargoTypeModel,
  ) {
    return this.cargoTypeService.updateCargoType(id, cargoType);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
  })
  public async deleteCargoType(@Param('id') id: string) {
    return this.cargoTypeService.deleteCargoType(id);
  }
}
