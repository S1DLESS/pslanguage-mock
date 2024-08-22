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
import { HomePageService } from './home-page/home-page.service';
import { Response } from 'express';
import { GamePageService } from 'src/game-page/game-page.service';
import { GameService } from 'src/game-page/game.service';
import { getQueries, getTheme, templateData } from './helpers/controller';

@Controller()
export class AppController {
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
    const queries = getQueries(game, language, platform);
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

  @Get(':siteLanguage')
  @Render('main-page')
  async getMainPage(
    @Param('siteLanguage') siteLanguage: string,
    @Headers('Cookie') cookie: string | undefined,
    @Query('game') game: string | undefined,
    @Query('language') language: string | undefined,
    @Query('platform') platform: string | undefined,
    @Res() res: Response
  ) {
    const theme = getTheme(cookie);
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
        css: ['css/style.css', 'css/main-page/main-page.css'],
        js: ['js/general.js', 'js/main-page.js'],
        theme,
        themeBtn: theme === 'light' ? 'Dark' : 'Light',
        ...data
      };
    } else {
      return res.redirect(`en${getQueries(game, language, platform)}`);
    }
  }

  @Get(':siteLanguage/game')
  async getNotFoundPage(
    @Param('siteLanguage') siteLanguage: string,
    @Headers('Cookie') cookie: string | undefined,
    @Res() res: Response
  ) {
    const theme = getTheme(cookie);
    const dbSiteLanguages = await this.homePageService.getSiteLanguage();
    return res.status(404).render('game-page', {
      ...templateData(dbSiteLanguages, siteLanguage),
      title: '',
      theme,
      themeBtn: theme === 'light' ? 'Dark' : 'Light'
    });
  }

  @Get(':siteLanguage/game/:id')
  async getGamePage(
    @Param('siteLanguage') siteLanguage: string,
    @Param('id') id: string,
    @Headers('Cookie') cookie: string | undefined,
    @Res() res: Response
  ) {
    // если id нет - не выполняется. Выполняется /game
    const theme = getTheme(cookie);
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
          ...templateData(dbSiteLanguages, siteLanguage, id, game.title),
          theme,
          themeBtn: theme === 'light' ? 'Dark' : 'Light',
          ...game,
          ...other
        });
      } else {
        return res.status(404).render('game-page', {
          ...templateData(dbSiteLanguages, siteLanguage, id),
          title: '',
          theme
        });
      }
    } else {
      return res.redirect(`en/game/${id}`);
    }
  }
}
