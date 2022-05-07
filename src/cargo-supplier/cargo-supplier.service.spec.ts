import { Test, TestingModule } from '@nestjs/testing';
import { CargoSupplierService } from './cargo-supplier.service';

describe('CargoSupplierService', () => {
  let service: CargoSupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CargoSupplierService],
    }).compile();

    service = module.get<CargoSupplierService>(CargoSupplierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
