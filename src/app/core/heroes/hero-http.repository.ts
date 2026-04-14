import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { HeroRepository } from './hero.repository';
import { Hero, CreateHeroDto, UpdateHeroDto } from '../../features/heroes/models/hero.model';
import { environment } from '../../environments/environment';

@Injectable()
export class HeroHttpRepository implements HeroRepository {
  private readonly _http = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/heroes`;

  getAll(): Observable<Hero[]> {
    return this._http.get<Hero[]>(this._base);
  }

  getById(id: string): Observable<Hero | undefined> {
    return this._http.get<Hero>(`${this._base}/${id}`);
  }

  searchByName(query: string): Observable<Hero[]> {
    const params = new HttpParams().set('name_like', query);
    return this._http.get<Hero[]>(this._base, { params });
  }

  create(dto: CreateHeroDto): Observable<Hero> {
    return this._http.post<Hero>(this._base, dto);
  }

  update(id: string, dto: UpdateHeroDto): Observable<Hero> {
    return this._http.patch<Hero>(`${this._base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this._http.delete<void>(`${this._base}/${id}`);
  }
}