import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../features/heroes/services/loading/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loadingService.loading()) {
      <div class="loading-overlay" role="status" aria-label="Cargando...">
        <mat-spinner diameter="56" />
      </div>
    }
  `,
})
export class SpinnerComponent {
  readonly loadingService = inject(LoadingService);
}