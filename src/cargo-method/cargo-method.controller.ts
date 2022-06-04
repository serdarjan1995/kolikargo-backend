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
import { CargoMethodService } from './cargo-method.service';
import { CargoMethodModel } from './models/cargoMethod.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('cargo-method')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class CargoMethodController {
  constructor(private cargoMethodService: CargoMethodService) {}

  @Get()
  @Roles(Role.User)
  public async getCargoMethods(@Query() query) {
    const name = query.name;
    const filter = {
      name: { $regex: `.*${name}.*`, $options: 'i' },
    };
    return await this.cargoMethodService.getCargoMethods({ filter });
  }

  @Post()
  @Roles(Role.Admin)
  public createCargoMethod(@Request() req, @Body() cargoMethod: CargoMethodModel) {
    return this.cargoMethodService.createCargoMethod(cargoMethod);
  }

  @Get(':id')
  @Roles(Role.User)
  public async getCargoMethodById(@Param('id') id: string) {
    return this.cargoMethodService.getCargoMethod(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  public async updateCargoMethod(
    @Param('id') id: string,
    @Body() cargoMethod: CargoMethodModel,
  ) {
    return this.cargoMethodService.updateCargoMethod(id, cargoMethod);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  public async deleteCargoMethod(@Param('id') id: string) {
    return this.cargoMethodService.deleteCargoMethod(id);
  }
}
