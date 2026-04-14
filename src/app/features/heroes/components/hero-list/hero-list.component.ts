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
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LoadingService } from '../../../../core/interceptors/loading.service';
import { Hero } from '../../models/hero.model';
import { HeroCardComponent } from '../hero-card/hero-card.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../confirm-dialog/confirm-dialog.component';
import { HeroesService } from '../../services/heroes/heroes.service';

const PAGE_SIZE = 4;
const INITIAL_LOAD_DELAY_MS = 800;

@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    HeroCardComponent

  ],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.scss',
})
export class HeroListComponent implements OnInit {
  private readonly _heroesService = inject(HeroesService);
  private readonly _loadingService = inject(LoadingService);
  private readonly _router = inject(Router);
  private readonly _dialog = inject(MatDialog);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _destroyRef = inject(DestroyRef);

  readonly filterControl = new FormControl('', { nonNullable: true });
  readonly pageIndex = signal(0);
  readonly currentPageSize = signal(PAGE_SIZE);
  readonly isInitialLoading = signal(true);

  get pageSize() {
    return PAGE_SIZE;
  }

  private readonly _filter = signal('');

  readonly filteredHeroes = computed(() =>
    this._heroesService.searchByName(this._filter())
  );

  readonly pagedHeroes = computed(() => {
    const start = this.pageIndex() * this.currentPageSize();
    return this.filteredHeroes().slice(start, start + this.currentPageSize());
  });

  ngOnInit(): void {
    // Spinner en carga inicial
    this._loadingService.show();
    setTimeout(() => {
      this._loadingService.hide();
      this.isInitialLoading.set(false);
    }, INITIAL_LOAD_DELAY_MS);

    // Filtro con debounce
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

  clearFilter(): void {
    this.filterControl.setValue('');
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.currentPageSize.set(event.pageSize);
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
      width: '420px',
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