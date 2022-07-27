import { Test, TestingModule } from '@nestjs/testing';
import { CargoPricingController } from './cargo-pricing.controller';

describe('CargoPricingController', () => {
  let controller: CargoPricingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargoPricingController],
    }).compile();

    controller = module.get<CargoPricingController>(CargoPricingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
