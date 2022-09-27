import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class ReviewAttachmentModel {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Link to attachment',
  })
  readonly link: string;
}

export class ReviewModel {
  readonly _id: Types.ObjectId;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID of the review',
  })
  readonly id: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Review text',
    default: null,
  })
  readonly text: string | null;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @ApiProperty({
    description: 'Review stars',
    default: null,
    minimum: 1,
    maximum: 5,
  })
  readonly stars: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewAttachmentModel)
  @ApiPropertyOptional({
    description: 'Attachments of the review',
    default: [],
  })
  attachments: ReviewAttachmentModel[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Is the review verified for listing',
    default: false,
  })
  verified: boolean;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ParentId if review is a reply type',
    default: null,
  })
  parent: string | null;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    description: 'Reply count if the review instance parent',
    default: 0,
  })
  replies: number;

  user: any;

  supplier: any;

  relatedCargo: any;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'Hide author name',
    default: true,
  })
  hideName: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Author name',
    default: 0,
  })
  authorName: string;
}

export class CreateReviewModel extends OmitType(ReviewModel, [
  'id',
  'user',
  'supplier',
  'replies',
  'relatedCargo',
  'verified',
  'authorName',
] as const) {}
