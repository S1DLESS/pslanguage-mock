export function getLanguagesNumber(numberOfLanguages: number) {
  let word = 'языков';
  if (numberOfLanguages % 10 === 1 && numberOfLanguages !== 11) {
    word = 'язык';
  }
  if (
    (numberOfLanguages % 10 === 2 && numberOfLanguages !== 12) ||
    (numberOfLanguages % 10 === 3 && numberOfLanguages !== 13) ||
    (numberOfLanguages % 10 === 4 && numberOfLanguages !== 14)
  ) {
    word = 'языка';
  }
  return `${numberOfLanguages} ${word}`;
}

export function getRegionsCount(textCase: string, regionsCount: number, lang: string | undefined) {
  switch (lang) {
    case 'ru':
      return `${regionsCount} ${
        regionsCount === 1
          ? textCase === 'N'
            ? 'регион'
            : 'регионе'
          : textCase === 'N'
            ? 'регионов'
            : 'регионах'
      }`;
    case 'en':
      return `${regionsCount} ${regionsCount === 1 ? 'region' : 'regions'}`;
    default:
      return '';
  }
}
