import { Test, TestingModule } from '@nestjs/testing';
import { GamePageController } from './game-page.controller';

describe('GamePageController', () => {
  let controller: GamePageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamePageController]
    }).compile();

    controller = module.get<GamePageController>(GamePageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
