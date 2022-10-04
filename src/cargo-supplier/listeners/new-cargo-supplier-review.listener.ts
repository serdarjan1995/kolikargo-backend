import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NewCargoSupplierReviewEvent } from '../events/new-cargo-supplier-review.event';
import { CargoSupplierService } from '../cargo-supplier.service';

@Injectable()
export class NewCargoSupplierReviewListener {
  constructor(private readonly cargoSupplierService: CargoSupplierService) {}

  @OnEvent('new.cargo.supplier.review')
  async handleNewCargoSupplierReviewEvent(event: NewCargoSupplierReviewEvent) {
    const supplier = await this.cargoSupplierService.getCargoSupplier(
      event.cargoSupplierId,
      true,
    );
    let newSupplierRating;
    let newReviewsCount;
    if (supplier.stars == 0) {
      // first review
      newSupplierRating = event.newRating;
      newReviewsCount = 1;
    } else {
      newSupplierRating =
        (supplier.stars * supplier.reviewsCount + event.newRating) /
        (supplier.reviewsCount + 1);
      supplier.stars = newSupplierRating;
      newReviewsCount = supplier.reviewsCount + 1;
    }
    await this.cargoSupplierService.updateCargoSupplierByFilter(
      {
        id: supplier.id,
      },
      {
        stars: Number(newSupplierRating.toFixed(2)),
        reviewsCount: newReviewsCount,
      },
    );
  }
}
