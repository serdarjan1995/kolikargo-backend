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
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CargoPricingService } from '../cargo-pricing/cargo-pricing.service';
import { RequestCode, UserLogin } from '../user/models/user.model';
import { UserService } from '../user/user.service';
import { SupplierLocalAuthGuard } from './supplier-local-auth.guard';
import { SupplierJwtAuthGuard } from './supplier-jwt-auth.guard';
import { checkNumber } from '../utils';

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
      await this.cargoSupplierService.validateIsOwner(id, req.user.userId);
    }
    return this.cargoSupplierService.updateCargoSupplier(id, cargoSupplier);
  }
}

@Controller('cargo-supplier/auth')
@ApiTags('cargo-supplier-auth')
export class CargoSupplierAuthController {
  constructor(
    private cargoSupplierService: CargoSupplierService,
    private userService: UserService,
  ) {}

  @Post('request-code')
  @ApiOkResponse({
    description: 'Successful Response',
  })
  public async supplierAuthRequestCode(@Body() reqCode: RequestCode) {
    if (!reqCode.phoneNumber) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please provide phoneNumber field',
          errorCode: 'phone_number_missing',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    checkNumber(reqCode.phoneNumber);

    const authCode = await this.cargoSupplierService.refreshCode(
      reqCode.phoneNumber,
    );
    if (!authCode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Please wait until previous code expires',
          errorCode: 'login_code_request_throttled',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return { success: true };
  }

  @UseGuards(SupplierLocalAuthGuard)
  @Post('login')
  @ApiOkResponse({
    description: 'Supplier Login Successful response',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'Access token' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Login Fail response',
  })
  @ApiBody({
    type: UserLogin,
  })
  public async login(@Request() req) {
    return this.cargoSupplierService.supplierLogin(req.user);
  }

  @UseGuards(SupplierJwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoSupplierModel,
  })
  getProfile(@Request() req) {
    return this.cargoSupplierService.getCargoSupplierByFilter({
      id: req.user.supplierId,
    });
  }
}
