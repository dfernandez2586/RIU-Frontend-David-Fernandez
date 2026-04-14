import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal } from '@angular/core';
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

function makeServiceSpy() {
  const _filteredHeroes = signal<Hero[]>(MOCK_HEROES);
  const _error = signal<string | null>(null);
  const _isListLoading = signal(false);
  const _isMutating = signal(false);

  return {
    filteredHeroes: _filteredHeroes.asReadonly(),
    error: _error.asReadonly(),
    isListLoading: _isListLoading.asReadonly(),
    isMutating: _isMutating.asReadonly(),
    isLoading: signal(false).asReadonly(),
    loadAll: vi.fn(),
    searchByName: vi.fn(),
    delete: vi.fn().mockReturnValue(of(undefined)),
    // expose internals so tests can change state
    _filteredHeroes,
    _error,
    _isListLoading,
  };
}

describe('HeroListComponent', () => {
  let fixture: ComponentFixture<HeroListComponent>;
  let component: HeroListComponent;
  let serviceSpy: ReturnType<typeof makeServiceSpy>;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let dialogSpy: { open: ReturnType<typeof vi.fn> };
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    serviceSpy = makeServiceSpy();
    routerSpy = { navigate: vi.fn() };
    dialogSpy = { open: vi.fn() };
    snackBarSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HeroListComponent],
      providers: [
        provideRouter(routes),
        { provide: HeroesService, useValue: serviceSpy },
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

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadAll() on init', () => {
    expect(serviceSpy.loadAll).toHaveBeenCalled();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('should render up to PAGE_SIZE hero cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-hero-card'));
    expect(cards.length).toBeLessThanOrEqual(component.pageSize);
  });

  it('should show paginator when there are heroes', () => {
    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).not.toBeNull();
  });

  it('should show empty state when filteredHeroes is empty', async () => {
    serviceSpy._filteredHeroes.set([]);
    fixture.detectChanges();
    await fixture.whenStable();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
  });

  it('should hide grid when isListLoading is true', async () => {
    serviceSpy._isListLoading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const grid = fixture.nativeElement.querySelector('.hero-grid');
    expect(grid).toBeNull();
  });

  it('should show error state when error signal has a value', async () => {
    serviceSpy._error.set('Network error');
    fixture.detectChanges();
    await fixture.whenStable();
    const errorState = fixture.nativeElement.querySelector('.error-state');
    expect(errorState).not.toBeNull();
  });

  // ── Filter ────────────────────────────────────────────────────────────────

  it('should call searchByName() and reset page after debounce', async () => {
    component.filterControl.setValue('superman');
    await new Promise((r) => setTimeout(r, 350));

    expect(serviceSpy.searchByName).toHaveBeenCalledWith('superman');
    expect(component.pageIndex()).toBe(0);
  });

  it('should NOT call searchByName() before debounce elapses', async () => {
    component.filterControl.setValue('bat');
    await new Promise((r) => setTimeout(r, 100));
    expect(serviceSpy.searchByName).not.toHaveBeenCalled();
  });

  it('clearFilter() should reset filterControl to empty string', () => {
    component.filterControl.setValue('batman');
    component.clearFilter();
    expect(component.filterControl.value).toBe('');
  });

  // ── Pagination ────────────────────────────────────────────────────────────

  it('onPageChange() should update pageIndex and currentPageSize', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 8, length: 10 } as any);
    expect(component.pageIndex()).toBe(1);
    expect(component.currentPageSize()).toBe(8);
  });

  it('pagedHeroes() should return correct slice for page 1', () => {
    component.pageIndex.set(1);
    const paged = component.pagedHeroes();
    expect(paged.length).toBeLessThanOrEqual(component.pageSize);
    expect(paged[0]).toEqual(MOCK_HEROES[component.pageSize]);
  });

  it('pagedHeroes() should return first page by default', () => {
    const paged = component.pagedHeroes();
    expect(paged[0]).toEqual(MOCK_HEROES[0]);
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  it('navigateToNew() should navigate to /heroes/new', () => {
    component.navigateToNew();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes/new']);
  });

  it('navigateToEdit() should navigate to /heroes/:id', () => {
    component.navigateToEdit(MOCK_HEROES[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/heroes', MOCK_HEROES[0].id]);
  });

  // ── Delete dialog ─────────────────────────────────────────────────────────

  it('openDeleteDialog() should open ConfirmDialogComponent', () => {
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) } as MatDialogRef<any>);
    component.openDeleteDialog(MOCK_HEROES[0]);
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should call delete() and show snackbar when confirmed', () => {
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<any>);
    component.openDeleteDialog(MOCK_HEROES[0]);
    expect(serviceSpy.delete).toHaveBeenCalledWith(MOCK_HEROES[0].id);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      `${MOCK_HEROES[0].name} eliminado`,
      'Cerrar',
      { duration: 3000 }
    );
  });

  it('should NOT call delete() when dialog is cancelled', () => {
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) } as MatDialogRef<any>);
    component.openDeleteDialog(MOCK_HEROES[0]);
    expect(serviceSpy.delete).not.toHaveBeenCalled();
  });
});