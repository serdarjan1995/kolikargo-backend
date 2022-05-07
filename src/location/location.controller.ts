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
import { LocationModel } from './models/location.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('location')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get()
  @Roles(Role.User)
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
  public createLocation(@Request() req, @Body() location: LocationModel) {
    return this.locationService.createLocation(location);
  }

  @Get(':id')
  @Roles(Role.User)
  public async getLocationById(@Param('id') id: string) {
    return this.locationService.getLocation(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  public async updateLocation(
    @Param('id') id: string,
    @Body() location: LocationModel,
  ) {
    return this.locationService.updateLocation(id, location);
  }
}
