// import { Controller, Get, Param, Res } from '@nestjs/common';
// import { GamePageService } from './game-page.service';
// import { GameService } from './game.service';
// import { Response } from 'express';

// @Controller('game')
// export class GamePageController {
//   constructor(
//     private readonly gamePageService: GamePageService,
//     private readonly gameService: GameService
//   ) {}

//   templateData(gameId?: string, siteTitle = 'Game not found') {
//     return {
//       lang: 'ru',
//       css: ['../css/style.css', '../css/game-page.css'],
//       js: ['../js/general.js', '../js/game-page.js'],
//       siteLanguages: [
//         {
//           link: `/ru/game${gameId ? `/${gameId}` : ''}`,
//           imgSrc: '../icons/RU.png',
//           imgAlt: 'RU_icon',
//           name: 'Русский'
//         },
//         {
//           link: `/en/game${gameId ? `/${gameId}` : ''}`,
//           imgSrc: '../icons/GB.png',
//           imgAlt: 'GB_icon',
//           name: 'English'
//         }
//       ],
//       siteTitle
//     };
//   }

//   @Get()
//   getNotFoundPage(@Res() res: Response) {
//     return res.status(404).render('game-page', {
//       ...this.templateData(),
//       title: ''
//     });
//   }

//   @Get(':id')
//   async getGamePage(@Param('id') id: string, @Res() res: Response) {
//     const game = await this.gameService.getGameData(id);

//     if (game) {
//       const other = await this.gamePageService.getAllGameData(
//         id,
//         game.platforms
//       );
//       return res.render('game-page', {
//         ...this.templateData(id, game.title),
//         ...game,
//         ...other
//       });
//     } else {
//       return res.status(404).render('game-page', {
//         ...this.templateData(id),
//         title: ''
//       });
//     }
//   }
// }
