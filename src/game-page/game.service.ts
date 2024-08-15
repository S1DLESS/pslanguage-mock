import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class GameService {
  constructor(
    private sequelize: Sequelize,
    private readonly i18n: I18nService
  ) {}

  private async getGame(gameId: any) {
    const [results] = await this.sequelize.query(`
      SELECT game.id, type_id, title, publisher, img_l_link from game
      WHERE game.id = ${gameId}
    `);
    return results[0];
  }

  private async getPlatforms(gameId: any) {
    const [results] = await this.sequelize.query(`
      SELECT platform_id, platform.name FROM game_platform
      INNER JOIN platform ON game_platform.platform_id = platform.id
      WHERE game_platform.game_id = ${gameId}
    `);
    results.forEach((platform: any) => {
      if (platform.name === 'PS4' || platform.name === 'PS5') {
        platform.class = 'ps';
      }
      if (platform.name === 'XBOX Series' || platform.name === 'XBOX One') {
        platform.class = 'xbox';
      }
    });
    return results;
  }

  async getGameData(gameId: any) {
    if (isNaN(gameId)) {
      return undefined;
    }
    const game: any = await this.getGame(gameId);
    if (game) {
      const platforms = await this.getPlatforms(gameId);
      return {
        imgSrc: game.img_l_link,
        imgAlt: game.title,
        type: this.i18n.t(`text.game-type.${game.type_id === 1 ? 'game' : 'dlc'}`, {
          lang: I18nContext.current()?.lang
        }),
        title: game.title,
        publisher: game.publisher,
        platforms
      };
    } else {
      return undefined;
    }
  }
}
