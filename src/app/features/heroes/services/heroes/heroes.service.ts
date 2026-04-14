import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, finalize, catchError, throwError } from 'rxjs';

import { HeroRepository } from '../../../../core/heroes/hero.repository';
import { LoadingService } from '../../../../core/interceptors/loading.service';
import { withLoading } from '../../../../core/operators/with-loading.operator';
import { CreateHeroDto, Hero, UpdateHeroDto } from '../../models/hero.model';

export type OperationState = 'idle' | 'loading' | 'error';

export interface HeroesState {
  heroes: Hero[];
  filteredHeroes: Hero[];
  listState: OperationState;
  mutationState: OperationState;
  error: string | null;
  cacheValid: boolean;
}

const INITIAL_STATE: HeroesState = {
  heroes: [],
  filteredHeroes: [],
  listState: 'idle',
  mutationState: 'idle',
  error: null,
  cacheValid: false,
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

  // ── READ ──────────────────────────────────────────────────────────────────

  loadAll(force = false): void {
    if (this._state().cacheValid && !force) return;

    this._patchState({ listState: 'loading', error: null });

    this._repo
      .getAll()
      .pipe(
        withLoading(this._loadingService),
        // El finalize es la única fuente de reset a 'idle' (safety net)
        finalize(() => {
          if (this._state().listState === 'loading') {
            this._patchState({ listState: 'idle' });
          }
        })
      )
      .subscribe({
        next: (heroes) =>
          // Sin listState: 'idle' — lo setea el finalize tras el next
          this._patchState({ heroes, filteredHeroes: heroes, cacheValid: true }),
        error: (err) =>
          this._patchState({ listState: 'error', error: this._extractMessage(err) }),
      });
  }

  searchByName(query: string): void {
    const q = query.trim();

    if (!q) {
      this.loadAll(true);
      return;
    }

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
          // Sin listState: 'idle' — lo setea el finalize tras el next
          this._patchState({ filteredHeroes, cacheValid: false }),
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

  // ── WRITE ─────────────────────────────────────────────────────────────────

  create(dto: CreateHeroDto): Observable<Hero> {
    this._patchState({ mutationState: 'loading', error: null });

    return this._repo.create(dto).pipe(
      withLoading(this._loadingService),
      tap((hero) =>
        // Sin mutationState: 'idle' — lo setea el finalize
        this._patchState({
          heroes: [...this._state().heroes, hero],
          filteredHeroes: [...this._state().filteredHeroes, hero],
          cacheValid: false,
        })
      ),
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
        // Sin mutationState: 'idle' — lo setea el finalize
        this._patchState({
          heroes: this._state().heroes.map(replaceFn),
          filteredHeroes: this._state().filteredHeroes.map(replaceFn),
          cacheValid: false,
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
        // Sin mutationState: 'idle' — lo setea el finalize
        this._patchState({
          heroes: this._state().heroes.filter(filterFn),
          filteredHeroes: this._state().filteredHeroes.filter(filterFn),
          cacheValid: false,
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