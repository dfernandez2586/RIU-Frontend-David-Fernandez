import { TestBed } from '@angular/core/testing';
import { HeroesService } from './heroes.service';
import { CreateHeroDto, UpdateHeroDto } from '../../models/hero.model';

describe('HeroesService', () => {
  let service: HeroesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroesService);
  });

  // ── Bootstrap ──────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose a readonly heroes signal', () => {
    expect(service.heroes).toBeDefined();
    expect(typeof service.heroes).toBe('function');
  });

  // ── getAll ─────────────────────────────────────────────────────────────

  it('getAll() should return the initial seed heroes', () => {
    const heroes = service.getAll();
    expect(heroes.length).toBeGreaterThan(0);
  });

  it('getAll() should return the same list as the signal', () => {
    expect(service.getAll()).toEqual(service.heroes());
  });

  // ── heroCount ──────────────────────────────────────────────────────────

  it('heroCount computed should reflect the current number of heroes', () => {
    const initial = service.heroCount();
    const dto: CreateHeroDto = {
      name: 'FLASH',
      alias: 'Barry Allen',
      power: 'Velocidad',
      universe: 'DC',
    };
    service.create(dto);
    expect(service.heroCount()).toBe(initial + 1);
  });

  // ── getById ────────────────────────────────────────────────────────────

  it('getById() should return the hero with the given id', () => {
    const all = service.getAll();
    const target = all[0];
    const found = service.getById(target.id);
    expect(found).toEqual(target);
  });

  it('getById() should return undefined for an unknown id', () => {
    expect(service.getById('nonexistent-id')).toBeUndefined();
  });

  // ── searchByName ────────────────────────────────────────────────────────

  it('searchByName() with empty string should return all heroes', () => {
    expect(service.searchByName('').length).toBe(service.getAll().length);
  });

  it('searchByName() with whitespace-only string should return all heroes', () => {
    expect(service.searchByName('   ').length).toBe(service.getAll().length);
  });

  it('searchByName("man") should return heroes whose name contains "man"', () => {
    const results = service.searchByName('man');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((h) =>
      expect(h.name.toLowerCase()).toContain('man')
    );
  });

  it('searchByName() should be case-insensitive', () => {
    const lower = service.searchByName('superman');
    const upper = service.searchByName('SUPERMAN');
    expect(lower).toEqual(upper);
  });

  it('searchByName() should return an empty array when no hero matches', () => {
    expect(service.searchByName('zzzzznotexists')).toEqual([]);
  });

  // ── create ─────────────────────────────────────────────────────────────

  it('create() should add a new hero to the list', () => {
    const before = service.getAll().length;
    const dto: CreateHeroDto = {
      name: 'AQUAMAN',
      alias: 'Arthur Curry',
      power: 'Control del agua',
      universe: 'DC',
    };
    const hero = service.create(dto);
    expect(service.getAll().length).toBe(before + 1);
    expect(hero.id).toBeTruthy();
    expect(hero.name).toBe('AQUAMAN');
    expect(hero.createdAt).toBeInstanceOf(Date);
  });

  it('create() should reflect the new hero in the signal', () => {
    const dto: CreateHeroDto = {
      name: 'HULK',
      alias: 'Bruce Banner',
      power: 'Fuerza infinita',
      universe: 'Marvel',
    };
    const hero = service.create(dto);
    expect(service.heroes().find((h) => h.id === hero.id)).toBeTruthy();
  });

  it('create() should generate unique ids for multiple heroes', () => {
    const dto: CreateHeroDto = {
      name: 'THOR',
      alias: 'Thor Odinson',
      power: 'Rayo',
      universe: 'Marvel',
    };
    const h1 = service.create(dto);
    const h2 = service.create(dto);
    expect(h1.id).not.toBe(h2.id);
  });

  // ── update ─────────────────────────────────────────────────────────────

  it('update() should modify the target hero', () => {
    const original = service.getAll()[0];
    const dto: UpdateHeroDto = { power: 'Nueva habilidad' };
    const updated = service.update(original.id, dto);
    expect(updated.power).toBe('Nueva habilidad');
    expect(updated.id).toBe(original.id);
  });

  it('update() should not affect other heroes', () => {
    const all = service.getAll();
    const target = all[0];
    const other = all[1];
    service.update(target.id, { name: 'NOMBRE NUEVO' });
    const afterOther = service.getById(other.id);
    expect(afterOther).toEqual(other);
  });

  it('update() should reflect changes in the signal', () => {
    const hero = service.getAll()[0];
    service.update(hero.id, { alias: 'New Alias' });
    const inSignal = service.heroes().find((h) => h.id === hero.id);
    expect(inSignal?.alias).toBe('New Alias');
  });

  it('update() should throw when hero id does not exist', () => {
    expect(() => service.update('bad-id', { name: 'X' })).toThrowError(
      /not found/i
    );
  });

  // ── delete ─────────────────────────────────────────────────────────────

  it('delete() should remove the hero from the list', () => {
    const target = service.getAll()[0];
    const before = service.getAll().length;
    service.delete(target.id);
    expect(service.getAll().length).toBe(before - 1);
    expect(service.getById(target.id)).toBeUndefined();
  });

  it('delete() should reflect removal in the signal', () => {
    const target = service.getAll()[0];
    service.delete(target.id);
    expect(service.heroes().find((h) => h.id === target.id)).toBeUndefined();
  });

  it('delete() with unknown id should not change list length', () => {
    const before = service.getAll().length;
    service.delete('nonexistent');
    expect(service.getAll().length).toBe(before);
  });
});