import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
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

function makeServiceSpy() {
  return {
    getById: vi.fn().mockReturnValue(of(MOCK_HERO)),
    create: vi.fn().mockReturnValue(of(MOCK_HERO)),
    update: vi.fn().mockReturnValue(of(MOCK_HERO)),
    isMutating: signal(false).asReadonly(),
  };
}

describe('HeroFormComponent', () => {
  let fixture: ComponentFixture<HeroFormComponent>;
  let component: HeroFormComponent;
  let serviceSpy: ReturnType<typeof makeServiceSpy>;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };

  async function createComponent(heroId: string | null = null): Promise<void> {
    serviceSpy = makeServiceSpy();
    routerSpy = { navigate: vi.fn() };
    snackBarSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
      providers: [
        provideRouter(routes),
        { provide: HeroesService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: buildRoute(heroId) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  // ── Create mode ───────────────────────────────────────────────────────────

  describe('create mode', () => {
    beforeEach(() => createComponent(null));

    it('should create', () => expect(component).toBeTruthy());

    it('should be in create mode', () => {
      expect(component.isEditMode).toBeFalsy();
    });

    it('form should start invalid (empty name)', () => {
      expect(component.heroForm.invalid).toBeTruthy();
    });

    it('name control should have required error when empty', () => {
      component.nameControl.markAsTouched();
      expect(component.nameControl.hasError('required')).toBeTruthy();
    });

    it('name control should have minlength error for 1-char name', () => {
      component.nameControl.setValue('A');
      expect(component.nameControl.hasError('minlength')).toBeTruthy();
    });

    it('alias control should have required error when empty', () => {
      component.aliasControl.markAsTouched();
      expect(component.aliasControl.hasError('required')).toBeTruthy();
    });

    it('power control should have required error when empty', () => {
      component.powerControl.markAsTouched();
      expect(component.powerControl.hasError('required')).toBeTruthy();
    });

    it('universe control should default to DC', () => {
      expect(component.universeControl.value).toBe('DC');
    });

    it('onSubmit() should do nothing when form is invalid', () => {
      component.onSubmit();
      expect(serviceSpy.create).not.toHaveBeenCalled();
    });

    it('onSubmit() should call create() and navigate when form is valid', () => {
      component.heroForm.setValue({
        name: 'HULK',
        alias: 'Bruce Banner',
        power: 'Fuerza',
        universe: 'Marvel',
      });
      component.onSubmit();
      expect(serviceSpy.create).toHaveBeenCalledWith({
        name: 'HULK',
        alias: 'Bruce Banner',
        power: 'Fuerza',
        universe: 'Marvel',
      });
      expect(snackBarSpy.open).toHaveBeenCalledWith('Héroe creado', 'Cerrar', { duration: 3000 });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
    });

    it('goBack() should navigate to /heroes', () => {
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  // ── Edit mode ─────────────────────────────────────────────────────────────

  describe('edit mode', () => {
    beforeEach(() => createComponent('42'));

    it('should be in edit mode', () => {
      expect(component.isEditMode).toBeTruthy();
    });

    it('should patch form with hero data', () => {
      expect(component.heroForm.value.name).toBe(MOCK_HERO.name);
      expect(component.heroForm.value.alias).toBe(MOCK_HERO.alias);
    });

    it('onSubmit() should call update() and navigate when form is valid', () => {
      component.onSubmit();

      // ✅ Vitest usa expect.objectContaining, no jasmine.objectContaining
      expect(serviceSpy.update).toHaveBeenCalledWith(
        '42',
        expect.objectContaining({ name: MOCK_HERO.name })
      );
      expect(snackBarSpy.open).toHaveBeenCalledWith('Héroe actualizado', 'Cerrar', { duration: 3000 });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  // ── Hero not found ────────────────────────────────────────────────────────

  describe('edit mode – hero not found', () => {
    it('should redirect to /heroes when hero id is not found', async () => {
      serviceSpy = makeServiceSpy();
      serviceSpy.getById.mockReturnValue(of(undefined));
      routerSpy = { navigate: vi.fn() };
      snackBarSpy = { open: vi.fn() };

      await TestBed.configureTestingModule({
        imports: [HeroFormComponent],
        providers: [
          provideRouter(routes),
          { provide: HeroesService, useValue: serviceSpy },
          { provide: Router, useValue: routerSpy },
          { provide: MatSnackBar, useValue: snackBarSpy },
          { provide: ActivatedRoute, useValue: buildRoute('nonexistent') },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HeroFormComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });
});