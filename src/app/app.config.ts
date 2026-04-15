import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { HeroRepository } from './core/heroes/hero.repository';
import { HeroInMemoryRepository } from './core/heroes/hero-in-memory.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: HeroRepository, useClass: HeroInMemoryRepository },
  ],
};