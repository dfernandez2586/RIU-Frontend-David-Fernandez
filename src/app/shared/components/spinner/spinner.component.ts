import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../features/heroes/services/loading/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loading()) {
      <div class="overlay">
        <mat-spinner />
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
    `,
  ],
})
export class SpinnerComponent {
  private readonly loadingService = inject(LoadingService);

  readonly loading = this.loadingService.loading;
}