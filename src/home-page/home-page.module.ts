import { Module } from '@nestjs/common';
import { HomePageController } from './home-page.controller';
import { HomePageService } from './home-page.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Currency } from 'src/models/currency.model';
import { GamePageService } from 'src/game-page/game-page.service';
import { GameService } from 'src/game-page/game.service';

@Module({
  imports: [SequelizeModule.forFeature([Currency])],
  controllers: [HomePageController],
  providers: [HomePageService, GamePageService, GameService]
})
export class HomePageModule {}
