import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Hero } from '../../models/hero.model';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { HeroesService } from '../../services/heroes/heroes.service';

@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    UppercaseDirective,
  ],
  templateUrl: './hero-form.component.html',
  styleUrl: './hero-form.component.scss'
})
export class HeroFormComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  readonly heroesService = inject(HeroesService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _destroyRef = inject(DestroyRef);

  readonly universes: Hero['universe'][] = ['Marvel', 'DC', 'Other'];
  isEditMode = false;
  private _heroId: string | null = null;

  readonly heroForm = this._fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    alias: ['', Validators.required],
    power: ['', Validators.required],
    universe: ['DC' as Hero['universe'], Validators.required],
  });

  get nameControl() { return this.heroForm.controls.name; }
  get aliasControl() { return this.heroForm.controls.alias; }
  get powerControl() { return this.heroForm.controls.power; }
  get universeControl() { return this.heroForm.controls.universe; }

  ngOnInit(): void {
    this._heroId = this._route.snapshot.paramMap.get('id');
    if (!this._heroId) return;

    this.isEditMode = true;

    this.heroesService
      .getById(this._heroId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((hero) => {
        if (!hero) {
          this._router.navigate(['/heroes']);
          return;
        }
        this.heroForm.patchValue({
          name: hero.name,
          alias: hero.alias,
          power: hero.power,
          universe: hero.universe,
        });
      });
  }

  onSubmit(): void {
    if (this.heroForm.invalid) return;

    const { name, alias, power, universe } = this.heroForm.getRawValue();

    if (this.isEditMode && this._heroId) {
      this.heroesService
        .update(this._heroId, { name, alias, power, universe })
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._snackBar.open('Héroe actualizado', 'Cerrar', { duration: 3000 });
          this._router.navigate(['/heroes']);
        });
    } else {
      this.heroesService
        .create({ name, alias, power, universe })
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this._snackBar.open('Héroe creado', 'Cerrar', { duration: 3000 });
          this._router.navigate(['/heroes']);
        });
    }
  }

  goBack(): void {
    this._router.navigate(['/heroes']);
  }
}