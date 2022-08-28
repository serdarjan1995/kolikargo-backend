import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdministrativeAreaModel,
  CATEGORY,
  FilterAdministrativeArea,
} from './models/administrativeArea.model';
import { AdministrativeAreaService } from './administrative-area.service';

@Controller('administrative-area')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('administrative-area')
export class AdministrativeAreaController {
  constructor(private administrativeAreaService: AdministrativeAreaService) {}

  @Get()
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: AdministrativeAreaModel,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response',
  })
  public async filter(@Query() query: FilterAdministrativeArea) {
    switch (query.category) {
      case CATEGORY.COUNTRY:
        return await this.administrativeAreaService.listCountries();

      case CATEGORY.PROVINCE:
        if (!query.country) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'country filter is required',
              errorCode: 'country_field_missing',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        return await this.administrativeAreaService.listProvinces(
          query.country,
        );

      case CATEGORY.CITY:
        if (!query.country || !query.parentName) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'parentName and country filters are required',
              errorCode: 'parent_name_and_country_field_missing',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        return await this.administrativeAreaService.listCities(
          query.country,
          query.parentName,
        );

      case CATEGORY.DISTRICT:
        if (!query.country || !query.parentName) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'parentName and country filters are required',
              errorCode: 'parent_name_and_country_field_missing',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
        return await this.administrativeAreaService.listDistricts(
          query.country,
          query.parentName,
        );

      default:
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Unknown category',
            errorCode: 'unknown_category',
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}
