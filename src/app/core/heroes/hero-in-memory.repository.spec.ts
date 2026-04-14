import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { HeroInMemoryRepository } from './hero-in-memory.repository';
import { CreateHeroDto, UpdateHeroDto } from '../../features/heroes/models/hero.model';

describe('HeroInMemoryRepository', () => {
  let repo: HeroInMemoryRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeroInMemoryRepository],
    });
    repo = TestBed.inject(HeroInMemoryRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  // ── getAll ────────────────────────────────────────────────────────────────

  it('getAll() should return the seeded heroes', async () => {
    const heroes = await firstValueFrom(repo.getAll());
    expect(heroes.length).toBeGreaterThan(0);
  });

  it('getAll() should return a copy of the store', async () => {
    const a = await firstValueFrom(repo.getAll());
    const b = await firstValueFrom(repo.getAll());
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  // ── getById ───────────────────────────────────────────────────────────────

  it('getById() should return the hero with the given id', async () => {
    const hero = await firstValueFrom(repo.getById('1'));
    expect(hero?.id).toBe('1');
  });

  it('getById() should return undefined for unknown id', async () => {
    const hero = await firstValueFrom(repo.getById('nonexistent'));
    expect(hero).toBeUndefined();
  });

  // ── searchByName ──────────────────────────────────────────────────────────

  it('searchByName() with empty string should return all heroes', async () => {
    const all = await firstValueFrom(repo.getAll());
    const results = await firstValueFrom(repo.searchByName(''));
    expect(results.length).toBe(all.length);
  });

  it('searchByName("man") should return heroes whose name contains "man"', async () => {
    const results = await firstValueFrom(repo.searchByName('man'));
    expect(results.length).toBeGreaterThan(0);
    results.forEach((h) => expect(h.name.toLowerCase()).toContain('man'));
  });

  it('searchByName() should be case-insensitive', async () => {
    const lower = await firstValueFrom(repo.searchByName('superman'));
    const upper = await firstValueFrom(repo.searchByName('SUPERMAN'));
    expect(lower).toEqual(upper);
  });

  it('searchByName() should return empty array when nothing matches', async () => {
    const results = await firstValueFrom(repo.searchByName('zzznotexists'));
    expect(results).toEqual([]);
  });

  // ── create ────────────────────────────────────────────────────────────────

  it('create() should add a hero and return it with id and createdAt', async () => {
    const dto: CreateHeroDto = {
      name: 'FLASH',
      alias: 'Barry Allen',
      power: 'Velocidad',
      universe: 'DC',
    };
    const hero = await firstValueFrom(repo.create(dto));
    expect(hero.id).toBeTruthy();
    expect(hero.createdAt).toBeInstanceOf(Date);
    expect(hero.name).toBe('FLASH');
  });

  it('create() should persist hero in store', async () => {
    const dto: CreateHeroDto = {
      name: 'AQUAMAN',
      alias: 'Arthur Curry',
      power: 'Control del agua',
      universe: 'DC',
    };
    const created = await firstValueFrom(repo.create(dto));
    const all = await firstValueFrom(repo.getAll());
    expect(all.find((h) => h.id === created.id)).toBeTruthy();
  });

  it('create() should generate unique ids', async () => {
    const dto: CreateHeroDto = {
      name: 'THOR',
      alias: 'Thor Odinson',
      power: 'Rayo',
      universe: 'Marvel',
    };
    const h1 = await firstValueFrom(repo.create(dto));
    const h2 = await firstValueFrom(repo.create(dto));
    expect(h1.id).not.toBe(h2.id);
  });

  // ── update ────────────────────────────────────────────────────────────────

  it('update() should modify the hero', async () => {
    const dto: UpdateHeroDto = { power: 'Nueva habilidad' };
    const updated = await firstValueFrom(repo.update('1', dto));
    expect(updated.power).toBe('Nueva habilidad');
    expect(updated.id).toBe('1');
  });

  it('update() should persist changes in store', async () => {
    await firstValueFrom(repo.update('1', { alias: 'New Alias' }));
    const hero = await firstValueFrom(repo.getById('1'));
    expect(hero?.alias).toBe('New Alias');
  });

  it('update() should throw for unknown id', async () => {
    await expect(
      firstValueFrom(repo.update('nonexistent', { name: 'X' }))
    ).rejects.toThrow(/not found/i);
  });

  // ── delete ────────────────────────────────────────────────────────────────

  it('delete() should remove the hero from store', async () => {
    await firstValueFrom(repo.delete('1'));
    const hero = await firstValueFrom(repo.getById('1'));
    expect(hero).toBeUndefined();
  });

  it('delete() should not affect other heroes', async () => {
    const before = await firstValueFrom(repo.getAll());
    await firstValueFrom(repo.delete('1'));
    const after = await firstValueFrom(repo.getAll());
    expect(after.length).toBe(before.length - 1);
    expect(after.find((h) => h.id === '2')).toBeTruthy();
  });

  it('delete() with unknown id should not change store length', async () => {
    const before = await firstValueFrom(repo.getAll());
    await firstValueFrom(repo.delete('nonexistent'));
    const after = await firstValueFrom(repo.getAll());
    expect(after.length).toBe(before.length);
  });
});