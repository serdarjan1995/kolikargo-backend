import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put, Query,
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
  CargoModel,
  CreateCargoModel,
  UpdateCargoStatusModel,
} from './models/cargo.model';
import { CargoPublicTrackingModel } from './models/cargoPublicTracking.model';

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
    return await this.cargoService.listUserCargos(user.userId);
  }

  @Get('/supplier/:id')
  @Roles(Role.Supplier)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
    isArray: true,
  })
  public async listSupplierCargos(@Param('id') id: string) {
    return await this.cargoService.listSupplierCargos(id);
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

  @Put(':id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CargoModel,
  })
  public async updateCargo(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFields: UpdateCargoStatusModel,
  ) {
    return await this.cargoService.updateCargo(id, updateFields);
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
