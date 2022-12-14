import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CargoService } from './cargo.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AuthenticatedUser } from '../user/models/user.model';
import { CARGO_STATUSES, CargoModel, CreateCargoModel, UpdateCargoStatusModel } from './models/cargo.model';
import { CargoPublicTrackingModel } from './models/cargoPublicTracking.model';
import { CargoTypeModel, CreateUpdateCargoTypeModel } from './models/cargoType.model';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { ListFilterSupplierCargosModel } from './models/ListFilterSupplierCargos.model';
import { SupplierCargoStatsModel } from './models/SupplierCargoStats.model';
import { StartDateEndDateQueryModel } from './models/startDateEndDate.model';
import {
  CargoStatusChangeActionModel,
  CreateCargoStatusChangeActionModel,
} from './models/cargoStatusChangeAction.model';

@Controller('cargo')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('cargo')
export class CargoController {
  constructor(private cargoService: CargoService) {}

  @Get()
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
    isArray: true,
  })
  public async listCargo(@Request() req) {
    const user: AuthenticatedUser = req.user;
    return await this.cargoService.listUserCargos(user.id);
  }

  @Post()
  @Roles(Role.User)
  @ApiCreatedResponse({
    description: 'Successful response',
    type: CargoModel,
  })
  public async createCargo(@Request() req, @Body() cargo: CreateCargoModel) {
    const user: AuthenticatedUser = req.user;
    // TODO : review minWeight validation
    return await this.cargoService.createCargo(cargo, user.id);
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
  @Roles(Role.User, Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async getCargoTrackingByCargoId(
    @Request() req,
    @Param('id') id: string,
  ) {
    return await this.cargoService.getCargoTracking(id);
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

@Controller('supplier/cargo')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('supplier-cargo')
export class SupplierCargoController {
  constructor(
    private cargoService: CargoService,
    private cargoSupplierService: CargoSupplierService,
  ) {}

  @Get('stats')
  @Roles(Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: SupplierCargoStatsModel,
  })
  public async getSupplierStats(
    @Request() req,
    @Query() query: StartDateEndDateQueryModel,
  ) {
    return await this.cargoService.supplierCargoStats(
      req.user.id,
      query.startDate,
      query.endDate,
    );
  }

  @Get()
  @Roles(Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
    isArray: true,
  })
  public async listSupplierCargos(
    @Request() req,
    @Query() query: ListFilterSupplierCargosModel,
  ) {
    return await this.cargoService.listSupplierCargos(req.user.id, query);
  }

  @Get(':cargoId')
  @Roles(Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async getSupplierCargoDetail(
    @Request() req,
    @Param('cargoId') cargoId: string,
  ) {
    return await this.cargoService.getSupplierCargoDetail(req.user.id, cargoId);
  }

  @Put(':cargoId')
  @Roles(Role.Admin, Role.Supplier)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async updateCargoStatusByCargoSupplier(
    @Request() req,
    @Param('cargoId') cargoId: string,
    @Body() updateFields: UpdateCargoStatusModel,
  ) {
    const filter = {};
    filter['supplier'] = await this.cargoSupplierService.idToObjectId(
      req.user.id,
    );

    const cargo = await this.cargoService.getCargoByFiler({ id: cargoId });
    const unchangeable_statuses = [
      CARGO_STATUSES.DELIVERED,
      CARGO_STATUSES.REJECTED,
      CARGO_STATUSES.CANCELLED,
    ];
    if (unchangeable_statuses.includes(<CARGO_STATUSES>cargo.status)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Cargo status cannot be changed`,
          errorCode: 'cargo_status_cannot_be_changed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.cargoService.updateCargo(
      cargoId,
      updateFields,
      false,
      filter,
    );
  }
}

@Controller('cargo-actions')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('cargo-actions')
export class CargoStatusChangeActionController {
  constructor(private cargoService: CargoService) {}

  @Post('status-change')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoStatusChangeActionModel,
  })
  public async createCargoStatusChangeAction(
    @Request() req,
    @Body() newCargoStatusChangeAction: CreateCargoStatusChangeActionModel,
  ) {
    return await this.cargoService.createCargoStatusChangeAction(
      newCargoStatusChangeAction,
    );
  }

  @Get('status-change')
  @Roles(Role.Admin, Role.Supplier)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoStatusChangeActionModel,
  })
  public async getCargoStatusChangeAction(
    @Request() req,
    @Query('fromStatus') fromStatus: CARGO_STATUSES,
  ) {
    return await this.cargoService.getCargoStatusChangeAction(fromStatus);
  }
}
