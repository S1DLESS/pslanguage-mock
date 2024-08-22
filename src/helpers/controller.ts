export function getQueries(
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

export function templateData(
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

export function getTheme(cookieHeader: string | undefined) {
  const regExpArr = cookieHeader ? cookieHeader.match(/dark|light/) : null;
  if (regExpArr) {
    return regExpArr[0];
  } else {
    return 'light';
  }
}
