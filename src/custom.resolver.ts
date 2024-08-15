import { ExecutionContext, Injectable } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';

@Injectable()
export class CustomResolver implements I18nResolver {
  resolve(context: ExecutionContext): string {
    const req = context.switchToHttp().getRequest();
    const firstParam = req.params['0'].split('/')[0];

    if (firstParam === 'search') {
      return req.headers['site-language'];
    }
    return firstParam;
  }
}
