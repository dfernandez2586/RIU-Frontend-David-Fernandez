import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { HeroFormComponent } from './hero-form.component';
import { Hero } from '../../models/hero.model';
import { routes } from '../../../../app.routes';
import { HeroesService } from '../../services/heroes/heroes.service';

const MOCK_HERO: Hero = {
  id: '42',
  name: 'SUPERMAN',
  alias: 'Clark Kent',
  power: 'Vuelo',
  universe: 'DC',
  createdAt: new Date(),
};

function buildRoute(id: string | null) {
  return {
    snapshot: { paramMap: convertToParamMap(id ? { id } : {}) },
  };
}

describe('HeroFormComponent', () => {
  let fixture: ComponentFixture<HeroFormComponent>;
  let component: HeroFormComponent;

  let heroesServiceSpy: any;
  let routerSpy: any;
  let snackBarSpy: any;

  function createComponent(heroId: string | null = null): void {
    heroesServiceSpy = {
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    if (heroId) {
      heroesServiceSpy.getById.mockReturnValue(MOCK_HERO);
    }

    routerSpy = {
      navigate: vi.fn(),
    };

    snackBarSpy = {
      open: vi.fn(),
    };

    TestBed.overrideProvider(ActivatedRoute, {
      useValue: buildRoute(heroId),
    });
    TestBed.overrideProvider(HeroesService, {
      useValue: heroesServiceSpy,
    });
    TestBed.overrideProvider(Router, { useValue: routerSpy });
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBarSpy });

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
      providers: [
        provideRouter(routes),
        { provide: HeroesService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: ActivatedRoute, useValue: buildRoute(null) },
      ],
    }).compileComponents();
  });

  // ── Create mode ──────────────────────────────────────────────────────────

  describe('create mode', () => {
    beforeEach(() => createComponent(null));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be in create mode', () => {
      expect(component.isEditMode).toBe(false);
    });

    it('form should start invalid (empty name)', () => {
      expect(component.heroForm.invalid).toBe(true);
    });

    it('name control should have required error when empty', () => {
      component.nameControl.markAsTouched();
      expect(component.nameControl.hasError('required')).toBe(true);
    });

    it('name control should have minlength error for 1-char name', () => {
      component.nameControl.setValue('A');
      component.nameControl.markAsTouched();
      expect(component.nameControl.hasError('minlength')).toBe(true);
    });

    it('alias control should have required error when empty', () => {
      component.aliasControl.markAsTouched();
      expect(component.aliasControl.hasError('required')).toBe(true);
    });

    it('power control should have required error when empty', () => {
      component.powerControl.markAsTouched();
      expect(component.powerControl.hasError('required')).toBe(true);
    });

    it('universe control should default to DC', () => {
      expect(component.universeControl.value).toBe('DC');
    });

    it('onSubmit() should do nothing when form is invalid', () => {
      component.onSubmit();
      expect(heroesServiceSpy.create).not.toHaveBeenCalled();
    });

    it('onSubmit() should call create() and navigate when form is valid', () => {
      heroesServiceSpy.create.mockReturnValue(MOCK_HERO);

      component.heroForm.setValue({
        name: 'HULK',
        alias: 'Bruce Banner',
        power: 'Fuerza',
        universe: 'Marvel',
      });

      component.onSubmit();

      expect(heroesServiceSpy.create).toHaveBeenCalledWith({
        name: 'HULK',
        alias: 'Bruce Banner',
        power: 'Fuerza',
        universe: 'Marvel',
      });

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Héroe creado',
        'Cerrar',
        { duration: 3000 }
      );

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
    });

    it('goBack() should navigate to /heroes', () => {
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  // ── Edit mode ────────────────────────────────────────────────────────────

  describe('edit mode', () => {
    beforeEach(() => createComponent('42'));

    it('should be in edit mode', () => {
      expect(component.isEditMode).toBe(true);
    });

    it('should patch form with hero data', () => {
      expect(component.heroForm.value.name).toBe(MOCK_HERO.name);
      expect(component.heroForm.value.alias).toBe(MOCK_HERO.alias);
    });

    it('onSubmit() should call update() and navigate when form is valid', () => {
      heroesServiceSpy.update.mockReturnValue(MOCK_HERO);

      component.onSubmit();

      expect(heroesServiceSpy.update).toHaveBeenCalledWith(
        '42',
        expect.objectContaining({ name: MOCK_HERO.name })
      );

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Héroe actualizado',
        'Cerrar',
        { duration: 3000 }
      );

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  // ── Hero not found ───────────────────────────────────────────────────────

  describe('edit mode – hero not found', () => {
    it('should redirect to /heroes when hero id is not found', () => {
      heroesServiceSpy = {
        getById: vi.fn().mockReturnValue(undefined),
        create: vi.fn(),
        update: vi.fn(),
      };

      routerSpy = { navigate: vi.fn() };
      snackBarSpy = { open: vi.fn() };

      TestBed.overrideProvider(ActivatedRoute, {
        useValue: buildRoute('nonexistent'),
      });
      TestBed.overrideProvider(HeroesService, {
        useValue: heroesServiceSpy,
      });
      TestBed.overrideProvider(Router, { useValue: routerSpy });
      TestBed.overrideProvider(MatSnackBar, { useValue: snackBarSpy });

      fixture = TestBed.createComponent(HeroFormComponent);
      fixture.detectChanges();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });
});