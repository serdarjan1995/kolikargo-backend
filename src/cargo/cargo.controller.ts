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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CargoService } from './cargo.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { AuthenticatedUser } from '../user/models/user.model';
import {
  CARGO_STATUSES,
  CargoModel,
  CreateCargoModel,
  UpdateCargoItemsModel,
  UpdateCargoStatusModel,
} from './models/cargo.model';
import { CargoPublicTrackingModel } from './models/cargoPublicTracking.model';
import {
  CargoTypeModel,
  CreateUpdateCargoTypeModel,
} from './models/cargoType.model';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { ListFilterSupplierCargosModel } from './models/ListFilterSupplierCargos.model';
import { SupplierCargoStatsModel } from './models/SupplierCargoStats.model';
import { StartDateEndDateQueryModel } from './models/startDateEndDate.model';
import {
  CargoStatusChangeActionModel,
  CreateCargoStatusChangeActionModel,
} from './models/cargoStatusChangeAction.model';
import { CargoCommissionService } from './cargoCommission.service';
import {
  CargoSupplierPaymentModel,
  CreateCargoSupplierPaymentPeriodModel,
} from './models/cargoSupplierPayment.model';
import {
  CargoSupplierPaymentPeriodModel,
  CargoSupplierPaymentPeriodQueryModel,
} from './models/cargoSupplierPaymentPeriod.model';

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
  public async getCargoTypes(@Query() query) {
    return await this.cargoService.getCargoTypes(!!query?.flat);
  }

  @Post()
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    private cargoSupplierCommissionService: CargoCommissionService,
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
    return await this.cargoSupplierCommissionService.supplierCargoStats(
      req.user.id,
      query.startDate,
      query.endDate,
    );
  }

  @Get('payment-periods')
  @Roles(Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierPaymentPeriodModel,
  })
  public async getSupplierPaymentPeriods(
    @Request() req,
    @Query() query: StartDateEndDateQueryModel,
  ) {
    return await this.cargoSupplierCommissionService.listCargoSupplierPaymentPeriods(
      req.user.id,
      query.startDate,
      query.endDate,
    );
  }

  @Get('payments')
  @Roles(Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierPaymentModel,
    isArray: true,
  })
  public async getSupplierPayments(
    @Request() req,
    @Query() query: CargoSupplierPaymentPeriodQueryModel,
  ) {
    return await this.cargoSupplierCommissionService.listPaymentsOfThePeriod(
      req.user.id,
      query.period,
    );
  }

  @Post('period')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: SupplierCargoStatsModel,
  })
  public async createPaymentPeriod(
    @Request() req,
    @Body()
    newCargoSupplierPaymentPeriod: CreateCargoSupplierPaymentPeriodModel,
  ) {
    return await this.cargoSupplierCommissionService.createCargoSupplierPaymentPeriod(
      newCargoSupplierPaymentPeriod,
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

  @Put(':cargoId/cargo-items')
  @Roles(Role.Admin, Role.Supplier)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async updateCargoItemsByCargoSupplier(
    @Request() req,
    @Param('cargoId') cargoId: string,
    @Body() updateFields: UpdateCargoItemsModel,
  ) {
    const filter = {};
    filter['supplier'] = await this.cargoSupplierService.idToObjectId(
      req.user.id,
    );

    const cargo = await this.cargoService.getCargoByFiler({ id: cargoId });
    const valid_statuses = [
      CARGO_STATUSES.NEW_REQUEST,
      CARGO_STATUSES.AWAITING_PICKUP,
    ];
    if (!valid_statuses.includes(<CARGO_STATUSES>cargo.status)) {
      // restrict user to modify cargo contents if it is already in picked up
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Cargo items cannot be changed`,
          errorCode: 'cargo_items_cannot_be_changed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.cargoService.updateCargoItems(
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
