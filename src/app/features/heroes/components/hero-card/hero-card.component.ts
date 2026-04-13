import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Hero } from '../../models/hero.model';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './hero-card.component.html',
  styleUrl: './hero-card.component.scss',})
export class HeroCardComponent {
  readonly hero = input.required<Hero>();
  readonly editClicked = output<Hero>();
  readonly deleteClicked = output<Hero>();
}