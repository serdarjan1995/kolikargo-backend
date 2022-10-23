import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CargoService } from './cargo.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AuthenticatedUser } from '../user/models/user.model';
import { CargoModel, CreateCargoModel, UpdateCargoStatusModel } from './models/cargo.model';
import { CargoPublicTrackingModel } from './models/cargoPublicTracking.model';
import { CargoTypeModel, CreateUpdateCargoTypeModel } from './models/cargoType.model';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';

@Controller('cargo')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('cargo')
export class CargoController {
  constructor(
    private cargoService: CargoService,
    private cargoSupplierService: CargoSupplierService,
  ) {}

  @Get()
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
    isArray: true,
  })
  public async listCargo(@Request() req) {
    const user: AuthenticatedUser = req.user;
    return await this.cargoService.listUserCargos(user.userId);
  }

  @Get('/supplier/:id')
  @Roles(Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
    isArray: true,
  })
  public async listSupplierCargos(@Request() req, @Param('id') id: string) {
    if (!req.user.roles.includes(Role.Admin)) {
      // validate cargoSupplier is owned by user
      await this.cargoSupplierService.validateIsOwner(id, req.user.userId);
    }
    return await this.cargoService.listSupplierCargos(id);
  }

  @Get('/supplier/:id/cargo-detail/:cargoId')
  @Roles(Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async getSupplierCargoDetail(
    @Request() req,
    @Param('id') id: string,
    @Param('cargoId') cargoId: string,
  ) {
    if (!req.user.roles.includes(Role.Admin)) {
      // validate cargoSupplier is owned by user
      await this.cargoSupplierService.validateIsOwner(id, req.user.userId);
    }
    return await this.cargoService.getSupplierCargoDetail(id, cargoId);
  }

  @Post()
  @Roles(Role.User)
  @ApiCreatedResponse({
    description: 'Successful response',
    type: CargoModel,
  })
  public async createCargo(@Request() req, @Body() cargo: CreateCargoModel) {
    const user: AuthenticatedUser = req.user;
    return await this.cargoService.createCargo(cargo, user.userId);
  }

  @Get(':id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async getCargoPricingById(@Param('id') id: string) {
    return await this.cargoService.getCargo(id);
  }

  @Get(':id/tracking')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async getCargoTrackingByCargoId(@Param('id') id: string) {
    return await this.cargoService.getCargoTracking(id);
  }

  @Put('/supplier/:id/cargo-detail/:cargoId')
  @Roles(Role.Admin, Role.Supplier)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async updateCargoStatusByCargoSupplier(
    @Request() req,
    @Param('id') id: string,
    @Param('cargoId') cargoId: string,
    @Body() updateFields: UpdateCargoStatusModel,
  ) {
    const filter = {};
    if (!req.user.roles.includes(Role.Admin)) {
      // validate cargoSupplier is owned by user
      const cargoSupplier = await this.cargoSupplierService.validateIsOwner(
        id,
        req.user.userId,
      );
      filter['supplier'] = cargoSupplier._id;
    }
    return await this.cargoService.updateCargo(
      cargoId,
      updateFields,
      false,
      filter,
    );
  }

  @Put(':id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async updateCargoStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFields: UpdateCargoStatusModel,
    @Query() query,
  ) {
    let byTrackingNumber = false;
    if (query?.byTrackingNumber) {
      byTrackingNumber = true;
    }
    return await this.cargoService.updateCargo(
      id,
      updateFields,
      byTrackingNumber,
    );
  }
}

@Controller('track-cargo')
@ApiTags('cargo')
export class CargoPublicTrackingController {
  constructor(private cargoService: CargoService) {}

  @Get(':trackingNumber')
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoPublicTrackingModel,
  })
  public async getCargoDetails(
    @Param('trackingNumber') trackingNumber: string,
    @Query() query,
  ) {
    return await this.cargoService.getCargoDetailsByTrackingNumber(
      trackingNumber,
      true,
      query?.authToken,
    );
  }
}

@Controller('cargo-type')
@ApiTags('cargo')
export class CargoTypeController {
  constructor(private cargoService: CargoService) {}

  @Get()
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoTypeModel,
    isArray: true,
  })
  public async getCargoTypes() {
    return await this.cargoService.getCargoTypes();
  }

  @Post()
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoTypeModel,
  })
  public async createCargoType(
    @Request() req,
    @Body() newCargoType: CreateUpdateCargoTypeModel,
  ) {
    return await this.cargoService.createCargoType(newCargoType);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoTypeModel,
  })
  public async updateCargoType(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFields: CreateUpdateCargoTypeModel,
  ) {
    return await this.cargoService.updateCargoType(id, updateFields);
  }
}
