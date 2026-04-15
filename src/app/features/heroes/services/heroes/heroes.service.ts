import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, finalize, catchError, throwError } from 'rxjs';

import { HeroRepository } from '../../../../core/heroes/hero.repository';
import { withLoading } from '../../../../core/operators/with-loading.operator';
import { CreateHeroDto, Hero, UpdateHeroDto } from '../../models/hero.model';
import { LoadingService } from '../../../../core/services/loading.service';

export type OperationState = 'idle' | 'loading' | 'error';

export interface HeroesState {
  heroes: Hero[];
  filteredHeroes: Hero[];
  listState: OperationState;
  mutationState: OperationState;
  error: string | null;
  cacheValid: boolean;

  searchQuery: string;
  pageIndex: number;
  pageSize: number;
}

const INITIAL_STATE: HeroesState = {
  heroes: [],
  filteredHeroes: [],
  listState: 'idle',
  mutationState: 'idle',
  error: null,
  cacheValid: false,  
  searchQuery: '',
  pageIndex: 0,
  pageSize: 10,
};

@Injectable({ providedIn: 'root' })
export class HeroesService {
  private readonly _repo = inject(HeroRepository);
  private readonly _loadingService = inject(LoadingService);

  // ── State ────────────────────────────────────────────────────────────────
  private readonly _state = signal<HeroesState>({ ...INITIAL_STATE });

  // ── Public selectors ──────────────────────────────────────────────────────
  readonly heroes = computed(() => this._state().heroes);
  readonly filteredHeroes = computed(() => this._state().filteredHeroes);
  readonly listState = computed(() => this._state().listState);
  readonly mutationState = computed(() => this._state().mutationState);
  readonly error = computed(() => this._state().error);
  readonly isListLoading = computed(() => this._state().listState === 'loading');
  readonly isMutating = computed(() => this._state().mutationState === 'loading');
  readonly isLoading = computed(() => this.isListLoading() || this.isMutating());
  readonly heroCount = computed(() => this._state().heroes.length);

  readonly searchQuery = computed(() => this._state().searchQuery);
  readonly pageIndex = computed(() => this._state().pageIndex);
  readonly pageSize = computed(() => this._state().pageSize);

  // ── READ ──────────────────────────────────────────────────────────────────

  loadAll(force = false): void {
    if (this._state().cacheValid && !force) return;

    this._patchState({ listState: 'loading', error: null });

    this._repo
      .getAll()
      .pipe(
        withLoading(this._loadingService),
        finalize(() => {
          if (this._state().listState === 'loading') {
            this._patchState({ listState: 'idle' });
          }
        })
      )
      .subscribe({
        next: (heroes) => {
          const q = this._state().searchQuery;
          const filtered = q
            ? heroes.filter((h) => h.name.toLowerCase().includes(q.toLowerCase()))
            : heroes;
          this._patchState({
            heroes,
            filteredHeroes: filtered,
            cacheValid: true,
            listState: 'idle',
          });
        },
        error: (err) =>
          this._patchState({ listState: 'error', error: this._extractMessage(err) }),
      });
  }

  searchByName(query: string): void {
    const q = query.trim();

    this._patchState({ searchQuery: q, pageIndex: 0 });

    if (!q) {
      if (this._state().cacheValid) {
        this._patchState({ filteredHeroes: this._state().heroes });
        return;
      }
      this.loadAll(true);
      return;
    }

    // filtrar en memoria si hay cache
    if (this._state().cacheValid) {
      const filtered = this._state().heroes.filter((h) =>
        h.name.toLowerCase().includes(q.toLowerCase())
      );
      this._patchState({ filteredHeroes: filtered });
      return;
    }

    // delegar al repo (se usa cuando la caché aún no está completa)
    this._patchState({ listState: 'loading', error: null });

    this._repo
      .searchByName(q)
      .pipe(
        withLoading(this._loadingService),
        finalize(() => {
          if (this._state().listState === 'loading') {
            this._patchState({ listState: 'idle' });
          }
        })
      )
      .subscribe({
        next: (filteredHeroes) =>
          this._patchState({ filteredHeroes, listState: 'idle' }),
        error: (err) =>
          this._patchState({ listState: 'error', error: this._extractMessage(err) }),
      });
  }

  getById(id: string): Observable<Hero | undefined> {
    const cached = this._state().heroes.find((h) => h.id === id);
    if (cached) {
      return new Observable((obs) => {
        obs.next(cached);
        obs.complete();
      });
    }
    return this._repo.getById(id).pipe(withLoading(this._loadingService));
  }

  // ── Persistent UI state ───────────────────────────────────────────────────

  setPageIndex(index: number): void {
    this._patchState({ pageIndex: index });
  }

  setPageSize(size: number): void {
    this._patchState({ pageSize: size });
  }

  create(dto: CreateHeroDto): Observable<Hero> {
    this._patchState({ mutationState: 'loading', error: null });

    return this._repo.create(dto).pipe(
      withLoading(this._loadingService),
      tap((hero) => {
        const q = this._state().searchQuery.toLowerCase();
        const heroes = [...this._state().heroes, hero];
        const filteredHeroes = q
          ? [...this._state().filteredHeroes, ...(hero.name.toLowerCase().includes(q) ? [hero] : [])]
          : [...this._state().filteredHeroes, hero];
        this._patchState({ heroes, filteredHeroes, mutationState: 'idle' });
      }),
      catchError((err) => {
        this._patchState({ mutationState: 'error', error: this._extractMessage(err) });
        return throwError(() => err);
      }),
      finalize(() => {
        if (this._state().mutationState === 'loading') {
          this._patchState({ mutationState: 'idle' });
        }
      })
    );
  }

  update(id: string, dto: UpdateHeroDto): Observable<Hero> {
    this._patchState({ mutationState: 'loading', error: null });

    return this._repo.update(id, dto).pipe(
      withLoading(this._loadingService),
      tap((updated) => {
        const replaceFn = (h: Hero) => (h.id === id ? updated : h);
        this._patchState({
          heroes: this._state().heroes.map(replaceFn),
          filteredHeroes: this._state().filteredHeroes.map(replaceFn),
          mutationState: 'idle',
        });
      }),
      catchError((err) => {
        this._patchState({ mutationState: 'error', error: this._extractMessage(err) });
        return throwError(() => err);
      }),
      finalize(() => {
        if (this._state().mutationState === 'loading') {
          this._patchState({ mutationState: 'idle' });
        }
      })
    );
  }

  delete(id: string): Observable<void> {
    this._patchState({ mutationState: 'loading', error: null });

    return this._repo.delete(id).pipe(
      withLoading(this._loadingService),
      tap(() => {
        const filterFn = (h: Hero) => h.id !== id;
        this._patchState({
          heroes: this._state().heroes.filter(filterFn),
          filteredHeroes: this._state().filteredHeroes.filter(filterFn),
          mutationState: 'idle',
        });
      }),
      catchError((err) => {
        this._patchState({ mutationState: 'error', error: this._extractMessage(err) });
        return throwError(() => err);
      }),
      finalize(() => {
        if (this._state().mutationState === 'loading') {
          this._patchState({ mutationState: 'idle' });
        }
      })
    );
  }

  // ── PRIVATE ───────────────────────────────────────────────────────────────

  private _patchState(partial: Partial<HeroesState>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }

  private _extractMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'Error desconocido';
  }
}