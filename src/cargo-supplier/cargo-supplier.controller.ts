import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CargoSupplierService } from './cargo-supplier.service';
import { CargoSupplierModel } from './models/cargoSupplier.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('cargo-supplier')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class CargoSupplierController {
  constructor(private cargoSupplierService: CargoSupplierService) {}

  @Get()
  @Roles(Role.User)
  public async getCargoSuppliers(@Query() query) {
    const name = query.name;
    const weight = query.weight;
    const filter = {
      name: { $regex: `.*${name}.*`, $options: 'i' },
      minWeight: { $lt: weight },
    };
    return await this.cargoSupplierService.getCargoSuppliers({ filter });
  }

  @Post()
  @Roles(Role.Admin)
  public createCargoSupplier(
    @Request() req,
    @Body() cargoSupplier: CargoSupplierModel,
  ) {
    return this.cargoSupplierService.createCargoSupplier(cargoSupplier);
  }

  @Get(':id')
  @Roles(Role.User)
  public async getCargoSupplierById(@Param('id') id: string) {
    return this.cargoSupplierService.getCargoSupplier(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  public async updateCargoSupplier(
    @Param('id') id: string,
    @Body() cargoSupplier: CargoSupplierModel,
  ) {
    return this.cargoSupplierService.updateCargoSupplier(id, cargoSupplier);
  }
}
