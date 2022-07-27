import { Test, TestingModule } from '@nestjs/testing';
import { CargoPricingService } from './cargo-pricing.service';

describe('CargoPricingService', () => {
  let service: CargoPricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CargoPricingService],
    }).compile();

    service = module.get<CargoPricingService>(CargoPricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
