import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { Role } from '../../auth/role.enum';

export class CargoSupplierModel {
  readonly _id: Types.ObjectId;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID of the Cargo Supplier',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the Cargo Supplier',
    example: 'Yaka Kargo',
  })
  readonly name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Short description of the Cargo Supplier',
  })
  readonly description: string;

  @IsString()
  @ApiProperty({
    description: 'Logo/Image of the cargo supplier',
    example: 'https://picsum.photos/200/300',
  })
  readonly avatarUrl: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Number of starts received out of 5 | floating number',
  })
  stars: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Count of comments/reviews',
  })
  reviewsCount: number;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'List of reviews (latest)',
  })
  reviews: any[];

  @IsNotEmpty()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Does cargo supplier provide free packaging)',
    default: true,
  })
  readonly freePackaging: boolean;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Min service price provided',
    minimum: 0,
    default: 0,
    example: 1.99,
  })
  readonly minPrice: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Min weight of the service',
    example: 12,
  })
  readonly minWeight: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Delivery time min days',
    minimum: 0,
    example: 10,
  })
  readonly deliveryEstimationMin: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Delivery time max days',
    minimum: 0,
    example: 15,
  })
  readonly deliveryEstimationMax: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Contact phone number of the cargo supplier',
    example: '+901234567890',
  })
  readonly phoneNumber: string;

  user: any;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Is featured',
    default: false,
  })
  readonly featured: boolean;

  @IsArray()
  @ApiProperty({
    description: 'Providing service source locations',
    example: [
      '9322c384-fd8e-4a13-80cd-1cbd1ef95ba8',
      '986dcaf4-c1ea-4218-b6b4-e4fd95a3c28e',
    ],
  })
  serviceSourceLocations: any[];

  @IsArray()
  @ApiProperty({
    description: 'Providing service destination locations',
    example: [
      '9322c384-fd8e-4a13-80cd-1cbd1ef95ba8',
      '986dcaf4-c1ea-4218-b6b4-e4fd95a3c28e',
    ],
  })
  serviceDestinationLocations: any[];

  publicAuthToken: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Is the account active',
    example: true,
  })
  isActive: boolean;

  readonly roles: Role[];
}

export class CreateUpdateCargoSupplierModel extends OmitType(
  CargoSupplierModel,
  [
    'id',
    'stars',
    'reviewsCount',
    'reviews',
    'serviceSourceLocations',
    'serviceDestinationLocations',
    'minPrice',
    'publicAuthToken',
    'roles',
  ] as const,
) {}

export class UpdateCargoSupplierModel extends PickType(CargoSupplierModel, [
  'name',
  'description',
  'minWeight',
  'deliveryEstimationMin',
  'deliveryEstimationMax',
  'freePackaging',
  'phoneNumber',
] as const) {}

export class AuthenticatedCargoSupplier {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'ID of the cargo supplier',
  })
  supplierId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number of the supplier',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    description: 'supplier roles',
  })
  roles: string[];
}
