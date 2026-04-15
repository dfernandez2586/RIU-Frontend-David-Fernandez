import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { HeroesService } from './heroes.service';
import { HeroRepository } from '../../../../core/heroes/hero.repository';
import { LoadingService } from '../../../../core/services/loading.service';
import { CreateHeroDto, Hero, UpdateHeroDto } from '../../models/hero.model';

const MOCK_HEROES: Hero[] = [
  {
    id: '1',
    name: 'SUPERMAN',
    alias: 'Clark Kent',
    power: 'Vuelo',
    universe: 'DC',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'BATMAN',
    alias: 'Bruce Wayne',
    power: 'Inteligencia',
    universe: 'DC',
    createdAt: new Date(),
  },
];

function makeRepoSpy() {
  return {
    getAll: vi.fn().mockReturnValue(of(MOCK_HEROES)),
    getById: vi.fn().mockReturnValue(of(MOCK_HEROES[0])),
    searchByName: vi.fn().mockReturnValue(of([MOCK_HEROES[0]])),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

describe('HeroesService', () => {
  let service: HeroesService;
  let repoSpy: ReturnType<typeof makeRepoSpy>;

  beforeEach(() => {
    repoSpy = makeRepoSpy();

    TestBed.configureTestingModule({
      providers: [
        HeroesService,
        LoadingService,
        { provide: HeroRepository, useValue: repoSpy },
      ],
    });

    service = TestBed.inject(HeroesService);
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty heroes and idle state', () => {
    expect(service.heroes()).toEqual([]);
    expect(service.filteredHeroes()).toEqual([]);
    expect(service.listState()).toBe('idle');
    expect(service.mutationState()).toBe('idle');
    expect(service.error()).toBeNull();
    expect(service.isLoading()).toBeFalsy();
    expect(service.heroCount()).toBe(0);
  });

  // ── loadAll ───────────────────────────────────────────────────────────────

  it('loadAll() should fetch heroes and update state', () => {
    service.loadAll();
    expect(service.heroes()).toEqual(MOCK_HEROES);
    expect(service.filteredHeroes()).toEqual(MOCK_HEROES);
    expect(service.listState()).toBe('idle');
    expect(service.heroCount()).toBe(2);
  });

  it('loadAll() should set cacheValid after first load', () => {
    service.loadAll();
    service.loadAll(); // Segunda llamada
    expect(repoSpy.getAll).toHaveBeenCalledTimes(1);
  });

  it('loadAll(force=true) should bypass cache', () => {
    service.loadAll();
    service.loadAll(true);
    expect(repoSpy.getAll).toHaveBeenCalledTimes(2);
  });

  it('loadAll() should set error state on failure', () => {
    const subject = new Subject<Hero[]>();
    repoSpy.getAll.mockReturnValue(subject.asObservable());

    service.loadAll();
    expect(service.listState()).toBe('loading');

    subject.error(new Error('Network error'));

    expect(service.listState()).toBe('error');
    expect(service.error()).toBe('Network error');
  });

  // ── searchByName (Filtrado y Búsqueda) ───────────────────────────────────

  it('loadAll() should handle string errors', () => {
    const subject = new Subject<Hero[]>();
    repoSpy.getAll.mockReturnValue(subject.asObservable());
    service.loadAll();
    subject.error('string error');
    expect(service.error()).toBe('string error');
  });

  it('loadAll() should handle unknown errors', () => {
    const subject = new Subject<Hero[]>();
    repoSpy.getAll.mockReturnValue(subject.asObservable());
    service.loadAll();
    subject.error({ code: 500 });
    expect(service.error()).toBe('Error desconocido');
  });

  it('loadAll() finalize should reset listState to idle on success', () => {
    const subject = new Subject<Hero[]>();
    repoSpy.getAll.mockReturnValue(subject.asObservable());

    service.loadAll();
    expect(service.listState()).toBe('loading');

    subject.next(MOCK_HEROES);
    subject.complete();

    expect(service.listState()).toBe('idle');
    expect(service.heroes()).toEqual(MOCK_HEROES);
  });

  it('isListLoading should be true while fetching and false after', () => {
    const subject = new Subject<Hero[]>();
    repoSpy.getAll.mockReturnValue(subject.asObservable());

    service.loadAll();
    expect(service.isListLoading()).toBeTruthy();

    subject.next(MOCK_HEROES);
    subject.complete();
    expect(service.isListLoading()).toBeFalsy();
  });

  it('isMutating should be true while deleting and false after', () => {
    const subject = new Subject<void>();
    repoSpy.delete.mockReturnValue(subject.asObservable());

    service.delete('1').subscribe();
    expect(service.isMutating()).toBeTruthy();

    subject.next(undefined);
    subject.complete();
    expect(service.isMutating()).toBeFalsy();
  });

  it('isLoading should be true when list is loading', () => {
    const subject = new Subject<Hero[]>();
    repoSpy.getAll.mockReturnValue(subject.asObservable());

    service.loadAll();
    expect(service.isLoading()).toBeTruthy();

    subject.next(MOCK_HEROES);
    subject.complete();
    expect(service.isLoading()).toBeFalsy();
  });

  it('searchByName() with query should call repo.searchByName when cache is invalid', () => {
    service.searchByName('man');
    expect(repoSpy.searchByName).toHaveBeenCalledWith('man');
    expect(service.filteredHeroes()).toEqual([MOCK_HEROES[0]]);
  });

  it('searchByName() with query should filter in memory when cache is valid', () => {
    service.loadAll(); // cacheValid = true
    repoSpy.searchByName.mockClear();

    service.searchByName('SUPERMAN');

    expect(repoSpy.searchByName).not.toHaveBeenCalled();
    expect(service.filteredHeroes().length).toBe(1);
    expect(service.filteredHeroes()[0].name).toBe('SUPERMAN');
  });

  it('searchByName() with empty string should call loadAll when cache is invalid', () => {
    repoSpy.getAll.mockClear();
    service.searchByName('');
    expect(repoSpy.getAll).toHaveBeenCalledTimes(1);
  });

  it('searchByName() with whitespace should call loadAll when cache is invalid', () => {
    repoSpy.getAll.mockClear();
    service.searchByName('   ');
    expect(repoSpy.getAll).toHaveBeenCalledTimes(1);
  });

  it('searchByName() with empty string should restore from cache without calling repo if valid', () => {
    service.loadAll();
    repoSpy.getAll.mockClear();

    service.searchByName('');
    
    expect(repoSpy.getAll).not.toHaveBeenCalled();
    expect(service.filteredHeroes()).toEqual(MOCK_HEROES);
  });

  it('searchByName() should set error state on failure', () => {
    const subject = new Subject<Hero[]>();
    repoSpy.searchByName.mockReturnValue(subject.asObservable());

    service.searchByName('man');
    expect(service.listState()).toBe('loading');

    subject.error(new Error('Search failed'));

    expect(service.listState()).toBe('error');
    expect(service.error()).toBe('Search failed');
  });

    it('searchByName() finalize should reset listState to idle on success', () => {
    const subject = new Subject<Hero[]>();
    repoSpy.searchByName.mockReturnValue(subject.asObservable());

    service.searchByName('batman');
    expect(service.listState()).toBe('loading');

    subject.next([MOCK_HEROES[1]]);
    subject.complete();

    expect(service.listState()).toBe('idle');
    expect(service.filteredHeroes()).toEqual([MOCK_HEROES[1]]);
  });

  // ── getById ───────────────────────────────────────────────────────────────

  it('getById() should serve from cache when heroes are loaded', () => {
    service.loadAll();
    let result: Hero | undefined;
    service.getById('1').subscribe((h) => (result = h));
    expect(result).toEqual(MOCK_HEROES[0]);
    expect(repoSpy.getById).not.toHaveBeenCalled();
  });

  it('getById() should call repo when hero is not in cache', () => {
    service.getById('1').subscribe();
    expect(repoSpy.getById).toHaveBeenCalledWith('1');
  });

  // ── create ────────────────────────────────────────────────────────────────

  it('create() should add hero to state', () => {
    const dto: CreateHeroDto = {
      name: 'FLASH',
      alias: 'Barry Allen',
      power: 'Velocidad',
      universe: 'DC',
    };
    const newHero: Hero = { ...dto, id: '99', createdAt: new Date() };
    repoSpy.create.mockReturnValue(of(newHero));

    service.loadAll();
    service.create(dto).subscribe();

    expect(service.heroes().find((h) => h.id === '99')).toEqual(newHero);
    expect(service.filteredHeroes().find((h) => h.id === '99')).toEqual(newHero);
    expect(service.mutationState()).toBe('idle');
  });

  it('create() should set error state on failure', () => {
    const subject = new Subject<Hero>();
    repoSpy.create.mockReturnValue(subject.asObservable());
    service.create({} as CreateHeroDto).subscribe({ error: () => {} });
    subject.error(new Error('Create failed'));
    expect(service.mutationState()).toBe('error');
    expect(service.error()).toBe('Create failed');
  });

  it('create() finalize should reset mutationState to idle on success', () => {
    const dto: CreateHeroDto = { name: 'FLASH', alias: 'Barry Allen', power: 'Velocidad', universe: 'DC' };
    const newHero: Hero = { ...dto, id: '99', createdAt: new Date() };
    const subject = new Subject<Hero>();
    repoSpy.create.mockReturnValue(subject.asObservable());

    service.create(dto).subscribe();
    expect(service.mutationState()).toBe('loading');

    subject.next(newHero);
    subject.complete();

    expect(service.mutationState()).toBe('idle');
    expect(service.heroes().find((h) => h.id === '99')).toEqual(newHero);
  });

  // ── update ────────────────────────────────────────────────────────────────

  it('update() should replace hero in state', () => {
    service.loadAll();
    const dto: UpdateHeroDto = { power: 'Nueva habilidad' };
    const updated: Hero = { ...MOCK_HEROES[0], ...dto };
    repoSpy.update.mockReturnValue(of(updated));

    service.update('1', dto).subscribe();

    expect(service.heroes().find((h) => h.id === '1')?.power).toBe('Nueva habilidad');
    expect(service.mutationState()).toBe('idle');
  });

  it('update() should set error state on failure', () => {
    const subject = new Subject<Hero>();
    repoSpy.update.mockReturnValue(subject.asObservable());
    service.update('1', {}).subscribe({ error: () => {} });
    subject.error(new Error('Update failed'));
    expect(service.mutationState()).toBe('error');
    expect(service.error()).toBe('Update failed');
  });

  it('update() finalize should reset mutationState to idle on success', () => {
    service.loadAll();
    const dto: UpdateHeroDto = { power: 'Nueva habilidad' };
    const updated: Hero = { ...MOCK_HEROES[0], ...dto };
    const subject = new Subject<Hero>();
    repoSpy.update.mockReturnValue(subject.asObservable());

    service.update('1', dto).subscribe();
    expect(service.mutationState()).toBe('loading');

    subject.next(updated);
    subject.complete();

    expect(service.mutationState()).toBe('idle');
    expect(service.heroes().find((h) => h.id === '1')?.power).toBe('Nueva habilidad');
  });

  // ── delete ────────────────────────────────────────────────────────────────

  it('delete() should remove hero from state', () => {
    service.loadAll();
    repoSpy.delete.mockReturnValue(of(undefined));

    service.delete('1').subscribe();

    expect(service.heroes().find((h) => h.id === '1')).toBeUndefined();
    expect(service.mutationState()).toBe('idle');
  });

  it('isMutating should be true while deleting and false after', () => {
    const subject = new Subject<void>();
    repoSpy.delete.mockReturnValue(subject.asObservable());

    service.delete('1').subscribe();
    expect(service.isMutating()).toBeTruthy();

    subject.next(undefined);
    subject.complete();
    expect(service.isMutating()).toBeFalsy();
  });
});