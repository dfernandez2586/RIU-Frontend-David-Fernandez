import { Injectable, signal } from '@angular/core';
 
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();
 
  show(): void {
    this._loading.set(true);
  }
 
  hide(): void {
    this._loading.set(false);
  }
}