import { Test, TestingModule } from '@nestjs/testing';
import { CargoTypesService } from './cargo-type.service';

describe('CargoTypesService', () => {
  let service: CargoTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CargoTypesService],
    }).compile();

    service = module.get<CargoTypesService>(CargoTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
