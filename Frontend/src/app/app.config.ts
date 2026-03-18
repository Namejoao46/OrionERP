import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {provideRouter, withHashLocation} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation())]/*O withHashLocation() é uma estratégia de roteamento do Angular
    que muda a forma como a URL é estruturada e interpretada pelo sistema.
    Em vez de usar URLs limpas como meuapp.com/login, ele usa um cerquilha (hashtag): meuapp.com/#/login*/
};
