import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
import { ReviewService } from './review.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CreateReviewModel, ReviewModel } from './models/review.model';
import { AuthenticatedUser } from '../user/models/user.model';

@Controller('review')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get()
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: ReviewModel,
    isArray: true,
  })
  public async getAllReviews() {
    return this.reviewService.filterReviews({});
  }

  @Get('cargo-supplier/:id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: ReviewModel,
    isArray: true,
  })
  public async getCargoSupplierReviews(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.reviewService.getSupplierReviews(id);
  }

  @Post('cargo/:id')
  @Roles(Role.User)
  @ApiCreatedResponse({
    description: 'Successful response',
    type: ReviewModel,
  })
  public createReview(
    @Request() req,
    @Body() review: CreateReviewModel,
    @Param('id') id: string,
  ) {
    const user: AuthenticatedUser = req.user;
    return this.reviewService.createReview(review, user.id, id);
  }

  @Put(':id/verify')
  @Roles(Role.Admin)
  @ApiCreatedResponse({
    description: 'Successful response',
    type: ReviewModel,
  })
  public verifyReview(@Request() req, @Param('id') id: string) {
    return this.reviewService.updateReview(id, { verified: true });
  }
}
