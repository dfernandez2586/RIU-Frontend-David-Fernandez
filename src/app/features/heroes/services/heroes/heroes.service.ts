import { Injectable, signal, computed, inject } from '@angular/core';
import { LoadingService } from '../../../../core/interceptors/loading.service';
import { CreateHeroDto, Hero, UpdateHeroDto } from '../../models/hero.model';
 
const SIMULATED_DELAY_MS = 600;
 
const INITIAL_HEROES: Hero[] = [
  {
    id: '1',
    name: 'SUPERMAN',
    alias: 'Clark Kent',
    power: 'Vuelo, super fuerza, visión de rayos X',
    universe: 'DC',
    createdAt: new Date('2000-01-01'),
  },
  {
    id: '2',
    name: 'SPIDERMAN',
    alias: 'Peter Parker',
    power: 'Sentido arácnido, trepar paredes, telarañas',
    universe: 'Marvel',
    createdAt: new Date('2000-01-02'),
  },
  {
    id: '3',
    name: 'BATMAN',
    alias: 'Bruce Wayne',
    power: 'Inteligencia, artes marciales, tecnología',
    universe: 'DC',
    createdAt: new Date('2000-01-03'),
  },
  {
    id: '4',
    name: 'IRONMAN',
    alias: 'Tony Stark',
    power: 'Armadura tecnológica, inteligencia',
    universe: 'Marvel',
    createdAt: new Date('2000-01-04'),
  },
  {
    id: '5',
    name: 'WONDER WOMAN',
    alias: 'Diana Prince',
    power: 'Super fuerza, lazo de la verdad, vuelo',
    universe: 'DC',
    createdAt: new Date('2000-01-05'),
  },
  {
    id: '6',
    name: 'MARTÍN KARADAGIÁN',
    alias: 'Martín Karadagián',
    power: 'Fuerza descomunal, resistencia',
    universe: 'Other',
    createdAt: new Date('2000-01-06'),
  },
];
 
@Injectable({ providedIn: 'root' })
export class HeroesService {
  private readonly _loadingService = inject(LoadingService);
  private readonly _heroes = signal<Hero[]>([...INITIAL_HEROES]);
 
  readonly heroes = this._heroes.asReadonly();
  readonly heroCount = computed(() => this._heroes().length);
 
  // ── READ ──────────────────────────────────────────────────────────────
 
  getAll(): Hero[] {
    return this._heroes();
  }
 
  getById(id: string): Hero | undefined {
    return this._heroes().find((h) => h.id === id);
  }
 
  searchByName(query: string): Hero[] {
    const q = query.trim().toLowerCase();
    if (!q) return this._heroes();
    return this._heroes().filter((h) => h.name.toLowerCase().includes(q));
  }
 
  // ── WRITE con spinner ─────────────────────────────────────────────────
 
  create(dto: CreateHeroDto): Hero {
    this._withLoading(() => {
      const hero: Hero = {
        ...dto,
        id: this._generateId(),
        createdAt: new Date(),
      };
      this._heroes.update((list) => [...list, hero]);
    });
    return this._heroes()[this._heroes().length - 1];
  }
 
  update(id: string, dto: UpdateHeroDto): Hero {
    let updated: Hero | undefined;
    this._withLoading(() => {
      this._heroes.update((list) =>
        list.map((h) => {
          if (h.id !== id) return h;
          updated = { ...h, ...dto };
          return updated!;
        })
      );
    });
    if (!updated) throw new Error(`Hero with id "${id}" not found`);
    return updated;
  }
 
  delete(id: string): void {
    this._withLoading(() => {
      this._heroes.update((list) => list.filter((h) => h.id !== id));
    });
  }
 
  // ── PRIVATE ───────────────────────────────────────────────────────────
 
  private _withLoading(fn: () => void): void {
    this._loadingService.show();
    fn();
    setTimeout(() => this._loadingService.hide(), SIMULATED_DELAY_MS);
  }
 
  private _generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
}