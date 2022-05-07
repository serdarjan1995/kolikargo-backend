import { Test, TestingModule } from '@nestjs/testing';
import { CargoSupplierController } from './cargo-supplier.controller';

describe('CargoSupplierController', () => {
  let controller: CargoSupplierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargoSupplierController],
    }).compile();

    controller = module.get<CargoSupplierController>(CargoSupplierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
