import {
  Body,
  Controller,
  Delete,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CargoPricingService } from './cargo-pricing.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import {
  CargoPricingModel,
  CreateCargoPricingModel,
} from './models/cargoPricing.model';
import { AuthenticatedUser } from '../user/models/user.model';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';

@Controller('cargo-pricing')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('cargo-pricing')
export class CargoPricingController {
  constructor(
    private cargoPricingService: CargoPricingService,
    private cargoSupplierService: CargoSupplierService,
  ) {}

  @Get()
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoPricingModel,
    isArray: true,
  })
  @ApiQuery({
    name: 'supplier',
    required: false,
    description: 'filter by supplier',
  })
  public async listCargoPricing(@Query() query) {
    const supplierId = query.supplier;
    const filter = {};
    if (supplierId) {
      filter['supplier'] = await this.cargoSupplierService.idToObjectId(
        supplierId,
      );
    }
    return await this.cargoPricingService.filterCargoPricing(filter);
  }

  @Post()
  @Roles(Role.Supplier, Role.Admin)
  @ApiCreatedResponse({
    description: 'Successful response',
    type: CargoPricingModel,
  })
  public async createCargoPricing(
    @Request() req,
    @Body() cargoPricing: CreateCargoPricingModel,
  ) {
    const user: AuthenticatedUser = req.user;
    if (user.roles.includes(Role.Supplier)) {
      const supplierId = cargoPricing.supplier;
      // check if supplierId related with user associated with request
      const supplier = await this.cargoSupplierService.getCargoSupplierByUser(
        supplierId,
        user.userId,
      );
      if (!supplier) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'User has no permission to alter another cargo-supplier',
            errorCode: 'cargo_supplier_validation_error',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
    return this.cargoPricingService.createCargoPricing(cargoPricing);
  }

  @Get(':id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoPricingModel,
  })
  public async getCargoPricingById(@Param('id') id: string) {
    return this.cargoPricingService.getCargoPricing(id);
  }

  @Put(':id')
  @Roles(Role.Supplier, Role.Admin)
  // @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoPricingModel,
  })
  public async updateCargoPricing(
    @Request() req,
    @Param('id') id: string,
    @Body() cargoPricing: CreateCargoPricingModel,
  ) {
    await this.checkSupplierAssociatedWithUser(cargoPricing.supplier, req.user);
    return this.cargoPricingService.updateCargoPricing(id, cargoPricing);
  }

  public async checkSupplierAssociatedWithUser(supplierId, user) {
    if (user.roles.includes(Role.Supplier)) {
      // check if supplierId related with user associated with request
      const supplier = await this.cargoSupplierService.getCargoSupplierByUser(
        supplierId,
        user.userId,
      );
      if (!supplier) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'User has no permission to alter another cargo-supplier',
            errorCode: 'cargo_supplier_validation_error',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
  }

  @Delete(':id')
  @Roles(Role.Supplier, Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
  })
  @ApiNotFoundResponse({
    description: 'Not found response',
  })
  public async deleteCargoPricing(@Request() req, @Param('id') id: string) {
    const cargoPricing = await this.cargoPricingService.getCargoPricing(id);
    await this.checkSupplierAssociatedWithUser(
      cargoPricing.supplier.id,
      req.user,
    );
    return this.cargoPricingService.deleteCargoPricing(id);
  }
}
