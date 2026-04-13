import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _requests = signal(0);

  readonly loading = computed(() => this._requests() > 0);

  show(): void {
    this._requests.update((value) => value + 1);
  }

  hide(): void {
    this._requests.update((value) => Math.max(0, value - 1));
  }
}