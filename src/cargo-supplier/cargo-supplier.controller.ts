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
import {
  CargoSupplierModel,
  CreateUpdateCargoSupplierModel,
  UpdateCargoSupplierModel,
} from './models/cargoSupplier.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { LocationService } from '../location/location.service';
import { ListFilterCargoSupplierModel } from './models/ListFilterCargoSupplier.model';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CargoPricingService } from '../cargo-pricing/cargo-pricing.service';
import {
  CargoSupplierCommissionsModel,
  CreateCargoSupplierCommissionModel,
} from './models/cargoSupplierCommissions.model';

@Controller('cargo-supplier')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('cargo-supplier')
export class CargoSupplierController {
  constructor(
    private cargoSupplierService: CargoSupplierService,
    private locationService: LocationService,
    private cargoPricingService: CargoPricingService,
  ) {}

  @Get()
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierModel,
    isArray: true,
  })
  public async getCargoSuppliers(@Query() query: ListFilterCargoSupplierModel) {
    const filter = {};
    const name = query?.name;
    const minWeight = query?.minWeight;
    const maxWeight = query?.maxWeight;
    const featured = query?.featured;
    const destinationLocation = query?.destinationLocation;
    const sourceLocation = query?.sourceLocation;
    const cargoType = query?.cargoType;
    const cargoMethod = query?.cargoMethod;

    if (name) {
      filter['name'] = { $regex: `.*${name}.*`, $options: 'i' };
    }

    if (minWeight) {
      filter['minWeight'] = { $gte: minWeight };
    }

    if (maxWeight) {
      filter['minWeight'] = { $lte: maxWeight };
    }

    if (featured) {
      filter['featured'] = featured;
    }

    if (destinationLocation) {
      const destinationLocationObjectId =
        await this.locationService.idToObjectId(destinationLocation);
      filter['serviceDestinationLocations'] = {
        $in: destinationLocationObjectId,
      };
    }

    if (sourceLocation) {
      const sourceLocationObjectId = await this.locationService.idToObjectId(
        sourceLocation,
      );
      filter['serviceSourceLocations'] = {
        $in: sourceLocationObjectId,
      };
    }
    const pricingSupplierFilter = {};
    if (cargoType) {
      // check if supplier has valid pricing to support this cargo type
      pricingSupplierFilter['prices'] = { $all: [] };
      for (const c of cargoType) {
        pricingSupplierFilter['prices']['$all'].push({
          $elemMatch: {
            cargoType: c,
          },
        });
      }
    }

    if (cargoMethod) {
      // check if supplier has valid pricing to support this cargo method
      pricingSupplierFilter['cargoMethod'] = cargoMethod;
    }

    if (cargoType || cargoMethod) {
      const cargoPricing = await this.cargoPricingService.filterCargoPricing(
        pricingSupplierFilter,
      );
      let pricingSuppliers = cargoPricing.map((item) => item.supplier);
      pricingSuppliers = pricingSuppliers.filter((i) => i !== null);
      filter['_id'] = {
        $in: pricingSuppliers,
      };
    }

    return await this.cargoSupplierService.getCargoSuppliers(filter);
  }

  @Get('commissions')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierCommissionsModel,
    isArray: true,
  })
  public async listCargoSupplierCommissions() {
    return await this.cargoSupplierService.getSupplierCommissions({});
  }

  @Get(':id/commissions')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierCommissionsModel,
  })
  public async getCargoSupplierCommission(@Param('id') id: string) {
    const supplierObjectId = await this.cargoSupplierService.idToObjectId(id);
    return await this.cargoSupplierService.getSupplierCommissionByFilter({
      supplier: supplierObjectId,
    });
  }

  @Put(':id/commissions')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierCommissionsModel,
  })
  public async updateCargoSupplierCommission(
    @Param('id') id: string,
    @Body() updateParams: CreateCargoSupplierCommissionModel,
  ) {
    const supplierObjectId = await this.cargoSupplierService.idToObjectId(id);
    return await this.cargoSupplierService.updateCargoSupplierCommission(
      supplierObjectId,
      updateParams,
    );
  }

  @Post(':id/commissions')
  @Roles(Role.Admin)
  @ApiCreatedResponse({
    description: 'Successful response',
    type: CargoSupplierCommissionsModel,
  })
  public async createCargoSupplierCommission(
    @Request() req,
    @Param('id') id: string,
    @Body() cargoSupplierCommission: CreateCargoSupplierCommissionModel,
  ) {
    const supplierObjectId = await this.cargoSupplierService.idToObjectId(id);
    return this.cargoSupplierService.createCargoSupplierCommission(
      supplierObjectId,
      cargoSupplierCommission,
    );
  }

  @Post()
  @Roles(Role.Admin)
  @ApiCreatedResponse({
    description: 'Successful response',
    type: CargoSupplierModel,
  })
  public createCargoSupplier(
    @Request() req,
    @Body() cargoSupplier: CreateUpdateCargoSupplierModel,
  ) {
    return this.cargoSupplierService.createCargoSupplier(cargoSupplier);
  }

  @Get(':id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierModel,
  })
  public async getCargoSupplierById(@Param('id') id: string) {
    return this.cargoSupplierService.getCargoSupplier(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierModel,
  })
  public async updateCargoSupplierAdmin(
    @Param('id') id: string,
    @Body() cargoSupplier: CreateUpdateCargoSupplierModel,
  ) {
    return this.cargoSupplierService.updateCargoSupplier(id, cargoSupplier);
  }

  @Put('edit/:id')
  @Roles(Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierModel,
  })
  public async updateCargoSupplier(
    @Request() req,
    @Param('id') id: string,
    @Body() cargoSupplier: UpdateCargoSupplierModel,
  ) {
    if (!req.user.roles.includes(Role.Admin)) {
      // validate cargoSupplier is owned by user
      await this.cargoSupplierService.validateIsOwner(id, req.user.id);
    }
    return this.cargoSupplierService.updateCargoSupplier(id, cargoSupplier);
  }
}
