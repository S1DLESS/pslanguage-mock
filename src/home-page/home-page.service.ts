import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Sequelize } from 'sequelize-typescript';
import { SiteLanguage } from 'src/enums/enums';
import { getLanguagesNumber, getRegionsCount } from 'src/helpers/gameInfoHelpers';

@Injectable()
export class HomePageService {
  constructor(
    private sequelize: Sequelize,
    private readonly i18n: I18nService
  ) {}

  /** получить все регионы (для фильтра по языку) */
  private async getRegions(siteLanguageId: SiteLanguage) {
    const regions = await this.sequelize.query(`
      SELECT region.id, region.iso, region_name.name FROM region
      INNER JOIN region_name ON region_name.region_id = region.id AND region_name.site_language_id = ${siteLanguageId}
    `);
    return regions[0];
  }

  /** получить все языки для select и игр */
  private async getLanguages(siteLanguageId: number) {
    const languages = await this.sequelize.query(`
      SELECT language.id, language.iso, language.icon, language_name.name FROM language
      INNER JOIN language_name ON language_name.language_id = language.id AND language_name.site_language_id = ${siteLanguageId}
    `);
    return {
      forGames: languages[0],
      forSelect: languages[0].map((el: any) => {
        return {
          value: el.id,
          text: el.name
        };
      })
    };
  }

  /** получить все платформы для select и игр */
  private async getPlatforms() {
    const platforms = await this.sequelize.query(`
      SELECT * FROM platform
    `);
    return {
      forGames: platforms[0],
      forSelect: platforms[0].map((el: any) => {
        return {
          value: el.id,
          text: el.name
        };
      })
    };
  }

  /** получить список игр */
  private async getGames(searchPattern: string, languageId: string, platformId: string) {
    const titleFilter = searchPattern
      ? `WHERE title ILIKE '%${searchPattern.replaceAll("'", "''")}%'`
      : '';
    const platformFilter = platformId
      ? `HAVING ${platformId} = ANY(array_agg(game_platform.platform_id))`
      : '';
    const noLangQuery = `
      (
        SELECT COUNT(DISTINCT language_id) FROM region_languages
        WHERE language_type_id = 1 AND game_id = game.id
      ) AS audio_count,
      (
        SELECT array_agg(DISTINCT language_id) FROM region_languages
        WHERE language_type_id = 1 AND game_id = game.id
      ) AS audio_languages,
      (
        SELECT COUNT(DISTINCT language_id) FROM region_languages
        WHERE language_type_id = 2 AND game_id = game.id
      ) AS interface_count,
      (
        SELECT array_agg(DISTINCT language_id) FROM region_languages
        WHERE language_type_id = 2 AND game_id = game.id
      ) AS interface_languages,
      (
        SELECT COUNT(region_id) FROM game_region
        WHERE game_id = game.id
      ) AS regions_count
    `;
    const langQuery = `
      (
        SELECT COUNT(DISTINCT region_id) FROM region_languages
        WHERE game_id = game.id AND language_id = ${languageId}
      ) AS all_regions,
      (
        SELECT COUNT(region_id) FROM region_languages
        WHERE game_id = game.id AND language_id = ${languageId} AND language_type_id = 1
      ) AS audio_count,
      (
        SELECT array_agg(region_id) FROM region_languages
        WHERE game_id = game.id AND language_id = ${languageId} AND language_type_id = 1
      ) AS audio,
      (
        SELECT COUNT(region_id) FROM region_languages
        WHERE game_id = game.id AND language_id = ${languageId} AND language_type_id = 2
      ) AS interface_count,
      (
        SELECT array_agg(region_id) FROM region_languages
        WHERE game_id = game.id AND language_id = ${languageId} AND language_type_id = 2
      ) AS interface
    `;
    const games = await this.sequelize.query(`
      SELECT
        game.id,
        game.type_id,
        game.title,
        game.img_s_link,
        array_agg(game_platform.platform_id) AS platforms,
        ${languageId ? langQuery : noLangQuery}
      FROM game
      INNER JOIN game_platform ON game_platform.game_id = game.id
      ${titleFilter}
      GROUP BY game.id
      ${platformFilter}
    `);
    return games[0];
  }

  private getLanguageIcons(gameLanguageIds: any, allLanguages: any) {
    if (gameLanguageIds) {
      return gameLanguageIds.map((languageId: number) => {
        const language = allLanguages.find((lang: any) => {
          return lang.id === languageId;
        });
        return {
          iconSrc: `icons/${language.icon}.png`,
          iconAlt: `${language.iso}_icon`,
          name: language.name
        };
      });
    } else {
      return [];
    }
  }

  private getRegionIcons(gameRegionIds: any, allRegions: any) {
    if (gameRegionIds) {
      return gameRegionIds.map((regionId: number) => {
        const region = allRegions.find((reg: any) => {
          return reg.id === regionId;
        });
        return {
          iconSrc: `icons/${region.iso}.png`,
          iconAlt: `${region.iso}_icon`,
          name: region.name
        };
      });
    } else {
      return [];
    }
  }

  private getGamePlatforms(game: any, platforms: any) {
    return game.platforms.map((platformId: number) => {
      return {
        class: platformId === 1 || platformId === 2 ? 'ps' : 'xbox',
        name: platforms.find((platform: any) => platform.id === platformId).name
      };
    });
  }

  private langQueryFields(game: any, languages: any, regions: any, currentLanguageId: number) {
    const currentLang = this.getLanguageIcons([currentLanguageId], languages)[0];
    return {
      currentLanguage: currentLang,
      languageAvailability: this.i18n.t('text.language-availability-in-regions', {
        lang: I18nContext.current()?.lang,
        args: {
          language: currentLang.name,
          regions: getRegionsCount('', +game.all_regions, I18nContext.current()?.lang)
        }
      }),
      audioCount: this.i18n.t('text.audio', {
        lang: I18nContext.current()?.lang,
        args: { count: getRegionsCount('N', +game.audio_count, I18nContext.current()?.lang) }
      }),
      audioRegions: this.getRegionIcons(game.audio, regions),
      interfaceCount: this.i18n.t('text.interface', {
        lang: I18nContext.current()?.lang,
        args: { count: getRegionsCount('N', +game.interface_count, I18nContext.current()?.lang) }
      }),
      interfaceRegions: this.getRegionIcons(game.interface, regions)
    };
  }

  private noLangQueryFields(game: any, languages: any) {
    return {
      audioLanguagesNumber: this.i18n.t('text.audio', {
        lang: I18nContext.current()?.lang,
        args: { count: getLanguagesNumber(+game.audio_count) }
      }),
      audioLanguages: this.getLanguageIcons(game.audio_languages, languages),
      interfaceLanguagesNumber: this.i18n.t('text.interface', {
        lang: I18nContext.current()?.lang,
        args: { count: getLanguagesNumber(+game.interface_count) }
      }),
      interfaceLanguages: this.getLanguageIcons(game.interface_languages, languages),
      regionsNumber: this.i18n.t('text.availability-in-regions', {
        lang: I18nContext.current()?.lang,
        args: {
          regions: getRegionsCount('', +game.regions_count, I18nContext.current()?.lang)
        }
      })
    };
  }

  private getGamesData(
    games: any,
    languages: any,
    platforms: any,
    siteLanguage: any,
    searchLanguageId: string,
    regions: any
  ) {
    const otherFields = (game: any) => {
      return searchLanguageId
        ? this.langQueryFields(game, languages, regions, Number(searchLanguageId))
        : this.noLangQueryFields(game, languages);
    };
    return games.map((game: any) => {
      return {
        link: `${siteLanguage.iso}/game/${game.id}`,
        imgSrc: game.img_s_link,
        imgAlt: game.title,
        title: game.title,
        type: this.i18n.t(`text.game-type.${game.type_id === 1 ? 'game' : 'dlc'}`, {
          lang: I18nContext.current()?.lang
        }),
        platforms: this.getGamePlatforms(game, platforms),
        ...otherFields(game)
      };
    });
  }

  async getData(
    siteLanguage: any,
    searchGame: string,
    searchLanguage: string,
    searchPlatform: string,
    isSearch = false
  ) {
    const languages = await this.getLanguages(siteLanguage.id);
    const platforms = await this.getPlatforms();
    const dbGames = await this.getGames(searchGame, searchLanguage, searchPlatform);
    const regions = await this.getRegions(siteLanguage.id);
    const games = this.getGamesData(
      dbGames,
      languages.forGames,
      platforms.forGames,
      siteLanguage,
      searchLanguage,
      regions
    );
    if (!isSearch) {
      return {
        languages: languages.forSelect,
        platforms: platforms.forSelect,
        games
      };
    } else {
      return games;
    }
  }

  async getSiteLanguage(
    acceptLanguage?: string
  ): Promise<{ id: number; native_name: string; iso: string; icon: string }[]> {
    const language = await this.sequelize.query(`
      SELECT * FROM site_language
      ${acceptLanguage ? `WHERE iso = '${acceptLanguage.toLowerCase()}'` : ''}
    `);
    return language[0] as {
      id: number;
      native_name: string;
      iso: string;
      icon: string;
    }[];
  }
}
