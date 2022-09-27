import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { CargoService } from '../cargo/cargo.service';
import { CreateReviewModel, ReviewModel } from './models/review.model';
import { UserService } from '../user/user.service';
import { CARGO_STATUSES } from '../cargo/models/cargo.model';
import { NewCargoSupplierReviewEvent } from '../cargo-supplier/events/new-cargo-supplier-review.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { censorString } from '../utils';

const reviewModelProjection = {
  _id: false,
  __v: false,
  user: false,
  supplier: false,
  relatedCargo: false,
  verified: false,
};

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('Review')
    private readonly reviewModel: Model<ReviewModel>,
    private readonly cargoSupplierService: CargoSupplierService,
    private readonly cargoService: CargoService,
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  public populateFields = [
    {
      path: 'supplier',
      select: 'id name description avatarUrl stars',
    },
    {
      path: 'user',
      select: 'id name surname',
    },
  ];

  public async getSupplierReviews(supplierId: string): Promise<ReviewModel[]> {
    const supplier = await this.cargoSupplierService.idToObjectId(supplierId);

    const filter = {
      supplier: supplier._id,
      verified: true,
      parent: null,
    };
    return await this.reviewModel
      .find(filter, reviewModelProjection)
      .populate(this.populateFields)
      .exec();
  }

  public async filterReviews(filter: object): Promise<ReviewModel[]> {
    return await this.reviewModel
      .find(filter, reviewModelProjection)
      .populate(this.populateFields)
      .exec();
  }

  public async createReview(
    newReview: CreateReviewModel,
    userId: string,
    relatedCargoId: string,
  ): Promise<ReviewModel> {
    const user = await this.userService.getUserBy({ id: userId }, true, false);
    const cargo = await this.cargoService.getCargoByFiler(
      { id: relatedCargoId, user: user._id },
      true,
    );

    if (cargo.status !== CARGO_STATUSES.DELIVERED) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cargo has not been finished yet',
          errorCode: 'cargo_has_not_been_finished',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let parentReviewId = null;
    if (newReview?.parent) {
      // check if parent exists
      const parentReview = await this.getReviewByFilter({
        parent: newReview.parent,
      });
      if (!parentReview) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Parent Review Not Found for creating a reply',
            errorCode: 'parent_review_not_found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      parentReviewId = parentReview.id;
    } else {
      // check if customer already made a comment
      const existingReview = await this.getReviewByFilter({
        user: user._id,
        relatedCargo: cargo._id,
        parent: null,
      });
      if (existingReview) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Review has been made already by customer',
            errorCode: 'review_has_been_made_already',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const userName = user.name;
    const userSurname = user.surname;
    let authorName = `${userName} ${userSurname}`;
    if (newReview?.hideName) {
      authorName = `${censorString(userName)} ${censorString(userSurname)}`;
    }
    const review = await this.reviewModel.create({
      ...newReview,
      user: user._id,
      supplier: await this.cargoSupplierService.idToObjectId(cargo.supplier.id),
      relatedCargo: cargo._id,
      parent: parentReviewId,
      authorName: authorName,
    });

    if (parentReviewId || !newReview.text) {
      // if its reply from cargo supplier, mark it verified
      review.verified = true;
    }

    await review.validate();
    await review.save();
    const newCaroSupplierReviewEvent = new NewCargoSupplierReviewEvent();
    newCaroSupplierReviewEvent.cargoSupplierId = cargo.supplier.id;
    newCaroSupplierReviewEvent.newRating = newReview.stars;
    this.eventEmitter.emit(
      'new.cargo.supplier.review',
      newCaroSupplierReviewEvent,
    );
    return await this.getReview(review.id);
  }

  public async getReviewByFilter(filter) {
    const review = await this.reviewModel.findOne(filter).exec();
    if (!review) {
      return null;
    }
    return review;
  }

  public async getReview(id, noProjection = false): Promise<ReviewModel> {
    const review = await this.reviewModel
      .findOne({ id: id }, noProjection ? null : reviewModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!review) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Review Not Found',
          errorCode: 'review_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return review;
  }

  public async updateReview(
    id: string,
    updateParams: object,
  ): Promise<ReviewModel> {
    const review = await this.reviewModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!review) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Review Not Found',
          errorCode: 'review_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.getReview(review.id);
  }
}
