import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Sequelize } from 'sequelize-typescript';
import { LanguageType, SiteLanguage } from 'src/enums/enums';
import { getLanguagesNumber } from 'src/helpers/gameInfoHelpers';

// SELECT DISTINCT region.id AS "region_id", region.iso, region_name.name, game_region.price, currency.usd_rate, game_region.link FROM region_platform
// INNER JOIN region ON region.id = region_platform.region_id
// INNER JOIN region_name ON region_name.region_id = region_platform.region_id
// INNER JOIN game_region ON game_region.region_id = region_platform.region_id
// INNER JOIN currency ON currency.id = region_platform.currency_id
// WHERE platform_id IN (${platforms.map((el: any) => el.platform_id).toString()}) AND region_name.site_language_id = ${siteLanguageId} AND game_region.game_id = ${gameId}

interface IRegion {
  region_id: string;
  iso: string;
  name: string;
  price: string | null;
  usd_rate: string;
  link: string | null;
}

@Injectable()
export class GamePageService {
  constructor(
    private sequelize: Sequelize,
    private readonly i18n: I18nService
  ) {}

  private async getRegions(gameId: any, siteLanguageId: SiteLanguage, platforms: any) {
    const regions = await this.sequelize.query(`
      SELECT DISTINCT region_platform.region_id, region.iso, region_name.name, game_region.price, currency.usd_rate, game_region.link FROM region_platform
      LEFT JOIN game_region ON region_platform.region_id = game_region.region_id AND game_region.game_id = ${gameId}
      INNER JOIN region ON region_platform.region_id = region.id
      INNER JOIN region_name ON region_platform.region_id = region_name.region_id AND region_name.site_language_id = ${siteLanguageId}
      INNER JOIN currency ON region_platform.currency_id = currency.id
      WHERE region_platform.platform_id IN (${platforms.map((el: any) => el.platform_id).toString()})
    `);
    return regions[0] as IRegion[];
  }

  private async getLanguages(gameId: any, languageId: any) {
    const languages = await this.sequelize.query(`
      SELECT region_languages.language_id AS "id", language.iso, language.icon, language_name.name, region_languages.language_type_id, region_languages.region_id FROM region_languages
      INNER JOIN language ON language.id = region_languages.language_id
      INNER JOIN language_name ON language_name.language_id = region_languages.language_id
      WHERE region_languages.game_id = ${gameId} AND language_name.site_language_id = ${languageId}
    `);
    return languages[0];
  }

  private getUsdPrice(price: any, usdRate: number) {
    if (price) {
      const priceWithoutSigns = price.match(/[0-9,.]/g).join('');
      if (priceWithoutSigns.match(/[,.]..$/)) {
        const integer = priceWithoutSigns.slice(0, -3).match(/[0-9]/g).join('');
        const frac = priceWithoutSigns.match(/..$/)[0];
        return (Number(`${integer}.${frac}`) * usdRate).toFixed(2);
      } else {
        const integer = priceWithoutSigns.match(/[0-9]/g).join('');
        return (Number(integer) * usdRate).toFixed(2);
      }
    } else {
      return 0;
    }
  }

  private makeLanguages(languages: any, regionId: number, languageTypeId: LanguageType) {
    return languages
      .filter(
        (anyLanguage: any) =>
          anyLanguage.language_type_id === languageTypeId && anyLanguage.region_id === regionId
      )
      .map((requiredLanguage: any) => {
        return {
          src: `../../icons/${requiredLanguage.icon ? requiredLanguage.icon.toUpperCase() : 'unknown_country'}.png`,
          alt: `${requiredLanguage.iso}_icon`,
          language: requiredLanguage.name
        };
      });
  }

  private sortRegions(regions: IRegion[], languages: any) {
    const newArr = regions.map((el) => {
      const audioLanguages = this.makeLanguages(languages, +el.region_id, LanguageType.AUDIO);
      const interfaceLanguages = this.makeLanguages(
        languages,
        +el.region_id,
        LanguageType.INTERFACE
      );
      return {
        countryFlagSrc: `../../icons/${el.iso.toUpperCase()}.png`,
        countryFlagAlt: `${el.iso.toUpperCase()}_icon`,
        countryName: el.name,
        link: el.link,
        price: el.price,
        usdPrice: this.getUsdPrice(el.price, Number(el.usd_rate)),
        audioLanguages: this.i18n.t('text.audio', {
          lang: I18nContext.current()?.lang,
          args: { count: getLanguagesNumber(audioLanguages.length) }
        }),
        interfaceLanguages: this.i18n.t('text.interface', {
          lang: I18nContext.current()?.lang,
          args: { count: getLanguagesNumber(interfaceLanguages.length) }
        }),
        audio: audioLanguages,
        interface: interfaceLanguages
      };
    });
    newArr.sort((a, b) => {
      const aLanguages = a.audio.length + a.interface.length;
      const bLanguages = b.audio.length + b.interface.length;
      const aUsdPrice = a.usdPrice ? Number(a.usdPrice) : Infinity;
      const bUsdPrice = b.usdPrice ? Number(b.usdPrice) : Infinity;
      if (
        bLanguages > aLanguages ||
        (bLanguages === aLanguages && bUsdPrice < aUsdPrice) ||
        (bLanguages === aLanguages && bUsdPrice === aUsdPrice && b.countryName < a.countryName)
      ) {
        return 1;
      }
      if (
        bLanguages < aLanguages ||
        (bLanguages === aLanguages && bUsdPrice > aUsdPrice) ||
        (bLanguages === aLanguages && bUsdPrice === aUsdPrice && b.countryName > a.countryName)
      ) {
        return -1;
      }
      return 0;
    });
    return newArr.map((el, index) => {
      return { id: index + 1, ...el };
    });
  }

  private getListOfAllLanguages(languages: any) {
    const langMap = new Map();
    languages.forEach((lang: any) => {
      langMap.set(lang.id, { value: lang.name, text: lang.name });
    });
    const arr = [];
    for (const value of langMap.values()) {
      arr.push(value);
    }
    return arr;
  }

  async getAllGameData(gameId: any, platforms: any, siteLanguageId: number) {
    const regions = await this.getRegions(gameId, siteLanguageId, platforms);

    const allLanguages = await this.getLanguages(gameId, siteLanguageId);

    const languages = this.getListOfAllLanguages(allLanguages);

    const trows: any = this.sortRegions(regions, allLanguages);

    return {
      languages,
      trows
    };
  }
}
