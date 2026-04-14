import { Observable } from 'rxjs';
import { Hero, CreateHeroDto, UpdateHeroDto } from '../../features/heroes/models/hero.model';

export abstract class HeroRepository {
  abstract getAll(): Observable<Hero[]>;
  abstract getById(id: string): Observable<Hero | undefined>;
  abstract searchByName(query: string): Observable<Hero[]>;
  abstract create(dto: CreateHeroDto): Observable<Hero>;
  abstract update(id: string, dto: UpdateHeroDto): Observable<Hero>;
  abstract delete(id: string): Observable<void>;
}