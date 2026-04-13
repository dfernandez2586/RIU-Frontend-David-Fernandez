import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, SpinnerComponent],
  template: `
    <mat-toolbar color="primary">
      <span>🦸 Súper Héroes</span>
    </mat-toolbar>

    <main class="app-container">
      <router-outlet />
    </main>

    <app-spinner />
  `,
  styles: [
    `
      mat-toolbar span {
        font-size: 1.25rem;
        font-weight: 500;
        letter-spacing: 0.5px;
      }
    `,
  ],
})
export class AppComponent {}
