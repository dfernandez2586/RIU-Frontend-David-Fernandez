import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'heroes',
    pathMatch: 'full',
  },
  {
    path: 'heroes',
    loadComponent: () =>
      import('./features/heroes/components/hero-list/hero-list.component').then(
        (m) => m.HeroListComponent
      ),
  },
  {
    path: 'heroes/new',
    loadComponent: () =>
      import('./features/heroes/components/hero-form/hero-form.component').then(
        (m) => m.HeroFormComponent
      ),
  },
  {
    path: 'heroes/:id',
    loadComponent: () =>
      import('./features/heroes/components/hero-form/hero-form.component').then(
        (m) => m.HeroFormComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'heroes',
  },
];
