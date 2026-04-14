import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { HeroRepository } from './hero.repository';
import { Hero, CreateHeroDto, UpdateHeroDto } from '../../features/heroes/models/hero.model';
import { SEED_HEROES } from '../mocks/heroes.mock';

const SIMULATED_DELAY_MS = 300;

let heroes: Hero[] = [...SEED_HEROES];

@Injectable()
export class HeroInMemoryRepository implements HeroRepository {
  private _store: Hero[] = heroes.map((h) => ({ ...h }));

  getAll(): Observable<Hero[]> {
    return of([...this._store]).pipe(delay(SIMULATED_DELAY_MS));
  }

  getById(id: string): Observable<Hero | undefined> {
    const hero = this._store.find((h) => h.id === id);
    return of(hero ? { ...hero } : undefined).pipe(delay(SIMULATED_DELAY_MS));
  }

  searchByName(query: string): Observable<Hero[]> {
    const q = query.trim().toLowerCase();
    const result = q
      ? this._store.filter((h) => h.name.toLowerCase().includes(q))
      : [...this._store];
    return of(result.map((h) => ({ ...h }))).pipe(delay(SIMULATED_DELAY_MS));
  }

  create(dto: CreateHeroDto): Observable<Hero> {
    const hero: Hero = {
      ...dto,
      id: this._generateId(),
      createdAt: new Date(),
    };
    this._store = [...this._store, hero];
    return of({ ...hero }).pipe(delay(SIMULATED_DELAY_MS));
  }

  update(id: string, dto: UpdateHeroDto): Observable<Hero> {
    const index = this._store.findIndex((h) => h.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Hero with id "${id}" not found`));
    }
    const updated: Hero = { ...this._store[index], ...dto };
    this._store = this._store.map((h) => (h.id === id ? updated : h));
    return of({ ...updated }).pipe(delay(SIMULATED_DELAY_MS));
  }

  delete(id: string): Observable<void> {
    this._store = this._store.filter((h) => h.id !== id);
    return of(undefined as void).pipe(delay(SIMULATED_DELAY_MS));
  }

  private _generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
}