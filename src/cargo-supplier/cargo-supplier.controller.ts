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

    if (cargoType) {
      // check if supplier has valid pricing to support this cargo type
      const cargoPricing = await this.cargoPricingService.filterCargoPricing({
        cargoType: cargoType,
      });
      filter['_id'] = {
        $in: cargoPricing.map((item) => item.supplier),
      };
    }

    return await this.cargoSupplierService.getCargoSuppliers(filter);
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
  public async updateCargoSupplier(
    @Param('id') id: string,
    @Body() cargoSupplier: CreateUpdateCargoSupplierModel,
  ) {
    return this.cargoSupplierService.updateCargoSupplier(id, cargoSupplier);
  }
}
