import { Test, TestingModule } from '@nestjs/testing';
import { GamePageService } from './game-page.service';

describe('GamePageService', () => {
  let service: GamePageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamePageService]
    }).compile();

    service = module.get<GamePageService>(GamePageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
