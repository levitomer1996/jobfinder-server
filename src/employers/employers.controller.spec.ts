import { Test, TestingModule } from '@nestjs/testing';
import { EmployersController } from './employers.controller';

describe('EmployersController', () => {
  let controller: EmployersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployersController],
    }).compile();

    controller = module.get<EmployersController>(EmployersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
