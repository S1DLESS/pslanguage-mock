import { Module } from '@nestjs/common';
// import { GamePageController } from './game-page.controller';
import { GamePageService } from './game-page.service';
import { GameService } from './game.service';

@Module({
  // controllers: [GamePageController],
  providers: [GamePageService, GameService]
})
export class GamePageModule {}
