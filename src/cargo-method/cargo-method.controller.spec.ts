import { Test, TestingModule } from '@nestjs/testing';
import { CargoMethodController } from './cargo-method.controller';

describe('CargoMethodController', () => {
  let controller: CargoMethodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargoMethodController],
    }).compile();

    controller = module.get<CargoMethodController>(CargoMethodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
