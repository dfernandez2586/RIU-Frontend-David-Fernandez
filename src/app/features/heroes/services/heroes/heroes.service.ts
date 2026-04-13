import { Injectable, signal, computed } from '@angular/core';
import { CreateHeroDto, Hero, UpdateHeroDto } from '../../models/hero.model';

const INITIAL_HEROES: Hero[] = [
  {
    id: '1',
    name: 'Superman',
    alias: 'Clark Kent',
    power: 'Vuelo, super fuerza, visión de rayos X',
    universe: 'DC',
    createdAt: new Date('2000-01-01'),
  },
  {
    id: '2',
    name: 'Spiderman',
    alias: 'Peter Parker',
    power: 'Sentido arácnido, trepar paredes, telarañas',
    universe: 'Marvel',
    createdAt: new Date('2000-01-02'),
  },
  {
    id: '3',
    name: 'Batman',
    alias: 'Bruce Wayne',
    power: 'Inteligencia, artes marciales, tecnología',
    universe: 'DC',
    createdAt: new Date('2000-01-03'),
  },
  {
    id: '4',
    name: 'Ironman',
    alias: 'Tony Stark',
    power: 'Armadura tecnológica, inteligencia',
    universe: 'Marvel',
    createdAt: new Date('2000-01-04'),
  },
  {
    id: '5',
    name: 'Wonder Woman',
    alias: 'Diana Prince',
    power: 'Super fuerza, lazo de la verdad, vuelo',
    universe: 'DC',
    createdAt: new Date('2000-01-05'),
  },
  {
    id: '6',
    name: 'Manolito el fuerte',
    alias: 'Manolito García',
    power: 'Fuerza descomunal, resistencia',
    universe: 'Other',
    createdAt: new Date('2000-01-06'),
  },
];

@Injectable({ providedIn: 'root' })
export class HeroesService {
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

  // ── WRITE ─────────────────────────────────────────────────────────────

  create(dto: CreateHeroDto): Hero {
    const hero: Hero = {
      ...dto,
      id: this._generateId(),
      createdAt: new Date(),
    };
    this._heroes.update((list) => [...list, hero]);
    return hero;
  }

  update(id: string, dto: UpdateHeroDto): Hero {
    let updated: Hero | undefined;
    this._heroes.update((list) =>
      list.map((h) => {
        if (h.id !== id) return h;
        updated = { ...h, ...dto };
        return updated;
      })
    );
    if (!updated) throw new Error(`Hero with id "${id}" not found`);
    return updated;
  }

  delete(id: string): void {
    this._heroes.update((list) => list.filter((h) => h.id !== id));
  }

  // ── PRIVATE ───────────────────────────────────────────────────────────

  private _generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
}