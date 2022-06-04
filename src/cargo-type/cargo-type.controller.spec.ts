import { Test, TestingModule } from '@nestjs/testing';
import { CargoTypesController } from './cargo-type.controller';

describe('CargoTypesController', () => {
  let controller: CargoTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargoTypesController],
    }).compile();

    controller = module.get<CargoTypesController>(CargoTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
