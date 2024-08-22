import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { UrlParamResolver } from './i18n/url-param.resolver';
import { AppController } from './app.controller';
import { HomePageService } from './home-page/home-page.service';
import { GamePageService } from './game-page/game-page.service';
import { GameService } from './game-page/game.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      logging: false
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true
      },
      viewEngine: 'hbs',
      resolvers: [UrlParamResolver]
    })
  ],
  controllers: [AppController],
  providers: [HomePageService, GamePageService, GameService]
})
export class AppModule {}
