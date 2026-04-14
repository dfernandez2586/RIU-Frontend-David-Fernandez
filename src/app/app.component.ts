import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, SpinnerComponent],
  template: `
    <main class="app-container">
      <router-outlet />
    </main>

    <app-spinner />
  `,
  styles: [`
    .app-toolbar {
      background: linear-gradient(135deg, #1a1a2e 0%, #3949ab 100%);
      color: #fff;
      box-shadow: 0 2px 12px rgba(57, 73, 171, 0.35);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-logo {
      font-size: 1.5rem;
      margin-right: 10px;
    }

    .toolbar-title {
      font-size: 1.2rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  `],
})
export class AppComponent {}
