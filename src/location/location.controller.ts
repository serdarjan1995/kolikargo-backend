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
import { LocationService } from './location.service';
import { CreateLocationModel, LocationModel } from './models/location.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('location')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('location')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get()
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: LocationModel,
    isArray: true,
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'filter by country (2 letter ISO code)',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'filter by city',
  })
  public async getLocations(@Query() query) {
    const country = query.country || '';
    const city = query.city || '';
    const filter = {
      country: { $regex: `.*${country}.*`, $options: 'i' },
      city: { $regex: `.*${city}.*`, $options: 'i' },
    };
    return await this.locationService.getLocations(filter);
  }

  @Post()
  @Roles(Role.Admin)
  @ApiCreatedResponse({
    description: 'Successful Response',
    type: LocationModel,
  })
  public createLocation(@Request() req, @Body() location: CreateLocationModel) {
    return this.locationService.createLocation(location);
  }

  @Get(':id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: LocationModel,
  })
  public async getLocationById(@Param('id') id: string) {
    return this.locationService.getLocation(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: LocationModel,
  })
  public async updateLocation(
    @Param('id') id: string,
    @Body() location: LocationModel,
  ) {
    return this.locationService.updateLocation(id, location);
  }
}
