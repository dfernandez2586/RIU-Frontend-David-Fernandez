import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Hero } from '../../models/hero.model';
import { HeroCardComponent } from '../hero-card/hero-card.component';
import { HeroesService } from '../../services/heroes/heroes.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';


const PAGE_SIZE = 6;

@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    HeroCardComponent,
  ],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.scss',
})
export class HeroListComponent implements OnInit {
  private readonly _heroesService = inject(HeroesService);
  private readonly _router = inject(Router);
  private readonly _dialog = inject(MatDialog);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _destroyRef = inject(DestroyRef);

  readonly filterControl = new FormControl('', { nonNullable: true });
  readonly pageSize = PAGE_SIZE;

  private readonly _filter = signal('');
  readonly pageIndex = signal(0);

  readonly filteredHeroes = computed(() =>
    this._heroesService.searchByName(this._filter())
  );

  readonly pagedHeroes = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredHeroes().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.filterControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((value) => {
        this._filter.set(value);
        this.pageIndex.set(0);
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
  }

  navigateToNew(): void {
    this._router.navigate(['/heroes/new']);
  }

  navigateToEdit(hero: Hero): void {
    this._router.navigate(['/heroes', hero.id]);
  }

  openDeleteDialog(hero: Hero): void {
    const data: ConfirmDialogData = {
      title: '¿Eliminar héroe?',
      message: `¿Estás seguro de que deseas eliminar a ${hero.name}?`,
    };

    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this._heroesService.delete(hero.id);
          this._snackBar.open(`${hero.name} eliminado`, 'Cerrar', {
            duration: 3000,
          });
        }
      });
  }
}