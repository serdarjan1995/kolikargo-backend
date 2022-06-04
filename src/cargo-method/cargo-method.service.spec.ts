import { Test, TestingModule } from '@nestjs/testing';
import { CargoMethodService } from './cargo-method.service';

describe('CargoMethodService', () => {
  let service: CargoMethodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CargoMethodService],
    }).compile();

    service = module.get<CargoMethodService>(CargoMethodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
