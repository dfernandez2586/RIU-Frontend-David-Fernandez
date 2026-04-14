import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { describe, it, expect, beforeEach } from 'vitest';

import { routes } from './app.routes';
import { AppComponent } from './app.component';

describe('app.routes', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // ── Navegación dinámica ───────────────────────────────────────────────────

  it('should redirect empty path to /heroes', async () => {
    await router.navigate(['']);
    expect(location.path()).toBe('/heroes');
  });

  it('should navigate to /heroes', async () => {
    await router.navigate(['/heroes']);
    expect(location.path()).toBe('/heroes');
  });

  it('should navigate to /heroes/new', async () => {
    await router.navigate(['/heroes/new']);
    expect(location.path()).toBe('/heroes/new');
  });

  it('should navigate to /heroes/:id', async () => {
    await router.navigate(['/heroes', '42']);
    expect(location.path()).toBe('/heroes/42');
  });

  it('should redirect unknown paths to /heroes', async () => {
    await router.navigate(['/ruta-desconocida']);
    expect(location.path()).toBe('/heroes');
  });

  // ── Estructura estática del array de rutas ────────────────────────────────

  it('routes array should have 5 entries', () => {
    expect(routes.length).toBe(5);
  });

  it('root route should have pathMatch full', () => {
    const rootRoute = routes.find((r) => r.path === '');
    expect(rootRoute?.pathMatch).toBe('full');
  });

  it('root route should redirect to heroes', () => {
    const rootRoute = routes.find((r) => r.path === '');
    expect(rootRoute?.redirectTo).toBe('heroes');
  });

  it('heroes route should use loadComponent (lazy loading)', () => {
    const heroesRoute = routes.find((r) => r.path === 'heroes');
    expect(heroesRoute?.loadComponent).toBeDefined();
  });

  it('heroes/new route should use loadComponent (lazy loading)', () => {
    const newRoute = routes.find((r) => r.path === 'heroes/new');
    expect(newRoute?.loadComponent).toBeDefined();
  });

  it('heroes/:id route should use loadComponent (lazy loading)', () => {
    const editRoute = routes.find((r) => r.path === 'heroes/:id');
    expect(editRoute?.loadComponent).toBeDefined();
  });

  it('wildcard route should redirect to heroes', () => {
    const wildcardRoute = routes.find((r) => r.path === '**');
    expect(wildcardRoute?.redirectTo).toBe('heroes');
  });
});