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
import { CargoTypeModel } from './models/cargoType.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('cargo-type')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class CargoTypeController {
  constructor(private cargoTypeService: CargoTypeService) {}

  @Get()
  @Roles(Role.User)
  public async getCargoTypes(@Query() query) {
    const name = query.name;
    const filter = {
      name: { $regex: `.*${name}.*`, $options: 'i' },
    };
    return await this.cargoTypeService.getCargoTypes({ filter });
  }

  @Post()
  @Roles(Role.Admin)
  public createCargoType(@Request() req, @Body() cargoType: CargoTypeModel) {
    return this.cargoTypeService.createCargoType(cargoType);
  }

  @Get(':id')
  @Roles(Role.User)
  public async getCargoTypeById(@Param('id') id: string) {
    return this.cargoTypeService.getCargoType(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  public async updateCargoType(
    @Param('id') id: string,
    @Body() cargoType: CargoTypeModel,
  ) {
    return this.cargoTypeService.updateCargoType(id, cargoType);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  public async deleteCargoType(@Param('id') id: string) {
    return this.cargoTypeService.deleteCargoType(id);
  }
}
