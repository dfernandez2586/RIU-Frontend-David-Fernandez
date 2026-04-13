import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { HeroListComponent } from './hero-list.component';
import { Hero } from '../../models/hero.model';
import { routes } from '../../../../app.routes';
import { HeroesService } from '../../services/heroes/heroes.service';

const MOCK_HEROES: Hero[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  name: i % 2 === 0 ? `SUPERMAN ${i}` : `BATMAN ${i}`,
  alias: `Alias ${i}`,
  power: `Power ${i}`,
  universe: 'DC' as const,
  createdAt: new Date(),
}));

describe('HeroListComponent', () => {
  let fixture: ComponentFixture<HeroListComponent>;
  let component: HeroListComponent;

  let heroesServiceSpy: any;
  let routerSpy: any;
  let dialogSpy: any;
  let snackBarSpy: any;

  beforeEach(async () => {
    heroesServiceSpy = {
      searchByName: vi.fn().mockReturnValue(MOCK_HEROES),
      delete: vi.fn(),
      heroes: () => MOCK_HEROES,
    };

    routerSpy = {
      navigate: vi.fn(),
    };

    dialogSpy = {
      open: vi.fn(),
    };

    snackBarSpy = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeroListComponent],
      providers: [
        provideRouter(routes),
        { provide: HeroesService, useValue: heroesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Rendering ────────────────────────────────────────────────────────────

  it('should render up to PAGE_SIZE hero cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-hero-card'));
    expect(cards.length).toBeLessThanOrEqual(component.pageSize);
  });

  it('should show paginator when there are heroes', () => {
    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).not.toBeNull();
  });

  it('should show the empty state when there are no heroes', async () => {
    heroesServiceSpy.searchByName.mockReturnValue([]);

    component['_filter'].set('___no_match___');

    fixture.detectChanges();
    await fixture.whenStable();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
  });

  // ── Filter ────────────────────────────────────────────────────────────────

  it('should update filter signal and reset page after debounce', async () => {
    const filterSpy = vi.spyOn(component['_filter'], 'set');
    const pageResetSpy = vi.spyOn(component.pageIndex, 'set');

    component.filterControl.setValue('superman');

    await new Promise((r) => setTimeout(r, 300));

    expect(filterSpy).toHaveBeenCalledWith('superman');
    expect(pageResetSpy).toHaveBeenCalledWith(0);
  });

  it('should NOT update filter before debounce elapses', async () => {
    const filterSpy = vi.spyOn(component['_filter'], 'set');

    component.filterControl.setValue('bat');

    await new Promise((r) => setTimeout(r, 100));

    expect(filterSpy).not.toHaveBeenCalled();
  });

  // ── Pagination ────────────────────────────────────────────────────────────

  it('onPageChange() should update pageIndex', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 6, length: 10 } as any);
    expect(component.pageIndex()).toBe(1);
  });

  it('pagedHeroes() should return a slice based on pageIndex', () => {
    component.pageIndex.set(1);
    const paged = component.pagedHeroes();
    expect(paged.length).toBeLessThanOrEqual(component.pageSize);
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  it('navigateToNew() should navigate to /heroes/new', () => {
    component.navigateToNew();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes/new']);
  });

  it('navigateToEdit() should navigate to /heroes/:id', () => {
    component.navigateToEdit(MOCK_HEROES[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith([
      '/heroes',
      MOCK_HEROES[0].id,
    ]);
  });

  // ── Delete dialog ─────────────────────────────────────────────────────────

  it('openDeleteDialog() should open dialog', () => {
    dialogSpy.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.openDeleteDialog(MOCK_HEROES[0]);

    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should delete hero and show snackbar when confirmed', () => {
    dialogSpy.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.openDeleteDialog(MOCK_HEROES[0]);

    expect(heroesServiceSpy.delete).toHaveBeenCalledWith(MOCK_HEROES[0].id);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      `${MOCK_HEROES[0].name} eliminado`,
      'Cerrar',
      { duration: 3000 }
    );
  });

  it('should NOT delete hero when dialog is cancelled', () => {
    dialogSpy.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.openDeleteDialog(MOCK_HEROES[0]);

    expect(heroesServiceSpy.delete).not.toHaveBeenCalled();
  });
});