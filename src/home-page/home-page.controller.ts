import {
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Redirect,
  Render,
  Res
} from '@nestjs/common';
import { HomePageService } from './home-page.service';
import { Response } from 'express';
import { GamePageService } from 'src/game-page/game-page.service';
import { GameService } from 'src/game-page/game.service';

@Controller()
export class HomePageController {
  constructor(
    private readonly homePageService: HomePageService,
    private readonly gamePageService: GamePageService,
    private readonly gameService: GameService
  ) {}

  @Get()
  @Redirect()
  async redirect(
    @Headers('Accept-Language') acceptLanguage: string,
    @Query('game') game: string | undefined,
    @Query('language') language: string | undefined,
    @Query('platform') platform: string | undefined
  ) {
    const queries = this.getQueries(game, language, platform);
    const reg = acceptLanguage.match(/\w+$/);
    if (reg) {
      const siteLanguages = await this.homePageService.getSiteLanguage(reg[0]);
      if (siteLanguages.length) {
        return {
          url: `${siteLanguages[0].iso}${queries}`
        };
      }
    }

    return { url: `en${queries}` };
  }

  @Get('search')
  async getSearchData(
    @Headers('Site-Language') siteLanguage: string,
    @Query('game') game: string | undefined,
    @Query('language') language: string | undefined,
    @Query('platform') platform: string | undefined
  ) {
    const dbSiteLanguages = await this.homePageService.getSiteLanguage(siteLanguage);
    if (dbSiteLanguages.length) {
      return await this.homePageService.getData(
        dbSiteLanguages[0],
        game || '',
        language || '',
        platform || '',
        true
      );
    } else {
      throw new HttpException('Site language not found', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':siteLanguage/game')
  async getNotFoundPage(@Param('siteLanguage') siteLanguage: string, @Res() res: Response) {
    const dbSiteLanguages = await this.homePageService.getSiteLanguage();
    return res.status(404).render('game-page', {
      ...this.templateData(dbSiteLanguages, siteLanguage),
      title: ''
    });
  }

  @Get(':siteLanguage/game/:id')
  async getGamePage(
    @Param('siteLanguage') siteLanguage: string,
    @Param('id') id: string,
    @Res() res: Response
  ) {
    // если id нет - не выполняется. Выполняется /game
    const dbSiteLanguages = await this.homePageService.getSiteLanguage();
    const dbSiteLanguage = dbSiteLanguages.find((el) => {
      return el.iso === siteLanguage;
    });
    if (dbSiteLanguage) {
      const game = await this.gameService.getGameData(id);

      if (game) {
        const other = await this.gamePageService.getAllGameData(
          id,
          game.platforms,
          dbSiteLanguage.id
        );
        return res.render('game-page', {
          ...this.templateData(dbSiteLanguages, siteLanguage, id, game.title),
          ...game,
          ...other
        });
      } else {
        return res.status(404).render('game-page', {
          ...this.templateData(dbSiteLanguages, siteLanguage, id),
          title: ''
        });
      }
    } else {
      return res.redirect(`en/game/${id}`);
    }
  }

  @Get(':siteLanguage')
  @Render('main-page')
  async getMainPage(
    @Param('siteLanguage') siteLanguage: string,
    @Query('game') game: string | undefined,
    @Query('language') language: string | undefined,
    @Query('platform') platform: string | undefined,
    @Res() res: Response
  ) {
    const dbSiteLanguages = await this.homePageService.getSiteLanguage();
    const dbSiteLanguage = dbSiteLanguages.find((el) => {
      return el.iso === siteLanguage;
    });
    if (dbSiteLanguage) {
      const data = await this.homePageService.getData(
        dbSiteLanguage,
        game || '',
        language || '',
        platform || ''
      );
      return {
        lang: dbSiteLanguage.iso,
        siteLanguages: dbSiteLanguages.map((lang) => {
          return {
            link: `/${lang.iso}`,
            imgSrc: `../icons/${lang.icon}.png`,
            imgAlt: `${lang.icon}_icon`,
            name: lang.native_name
          };
        }),
        css: ['css/style.css', 'css/main-page/main.css'],
        js: ['js/general.js', 'js/main.js'],
        ...data
      };
    } else {
      return res.redirect(`en${this.getQueries(game, language, platform)}`);
    }
  }

  private getQueries(
    game: string | undefined,
    language: string | undefined,
    platform: string | undefined
  ) {
    const gameValue = game ? `?game=${game}` : '';
    const languageValue = language ? `${gameValue ? '&' : '?'}language=${language}` : '';
    const platformValue = platform
      ? `${gameValue || languageValue ? '&' : '?'}platform=${platform}`
      : '';
    return `${gameValue}${languageValue}${platformValue}`;
  }

  templateData(
    siteLanguages: any,
    currentSiteLanguage: string,
    gameId?: string,
    siteTitle = 'Game not found'
  ) {
    return {
      lang: currentSiteLanguage,
      css: ['../../css/style.css', '../../css/game-page/game-page.css'],
      js: ['../../js/general.js', '../../js/game-page.js'],
      siteLanguages: siteLanguages.map((lang: any) => {
        return {
          link: `/${lang.iso}/game${gameId ? `/${gameId}` : ''}`,
          imgSrc: `../../icons/${lang.icon}.png`,
          imgAlt: `${lang.icon}_icon`,
          name: lang.native_name
        };
      }),
      siteTitle
    };
  }
}
