import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HomePageModule } from './home-page/home-page.module';
import { GamePageModule } from './game-page/game-page.module';
import { Currency } from './models/currency.model';
import { ConfigModule } from '@nestjs/config';
import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { CustomResolver } from './custom.resolver';

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
      models: [Currency],
      logging: false
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true
      },
      viewEngine: 'hbs',
      resolvers: [CustomResolver]
    }),
    HomePageModule,
    GamePageModule
  ]
})
export class AppModule {}
