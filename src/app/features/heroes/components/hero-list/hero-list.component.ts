import {
  Component,
  computed,
  inject,
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

import { Hero } from '../../models/hero.model';
import { HeroCardComponent } from '../hero-card/hero-card.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../confirm-dialog/confirm-dialog.component';
import { HeroesService } from '../../services/heroes/heroes.service';

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
    HeroCardComponent,
  ],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.scss'
})
export class HeroListComponent implements OnInit {
  readonly heroesService = inject(HeroesService);

  private readonly _router = inject(Router);
  private readonly _dialog = inject(MatDialog);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _destroyRef = inject(DestroyRef);

  // filterControl se inicializa con el valor persistido en el servicio
  readonly filterControl = new FormControl('', { nonNullable: true });

  get pageSize(): number {
    return this.heroesService.pageSize();
  }

  readonly pagedHeroes = computed(() => {
    const start = this.heroesService.pageIndex() * this.heroesService.pageSize();
    return this.heroesService.filteredHeroes().slice(start, start + this.heroesService.pageSize());
  });

  ngOnInit(): void {
    // Restaurar filtro persistido sin disparar debounce
    const savedQuery = this.heroesService.searchQuery();
    if (savedQuery) {
      this.filterControl.setValue(savedQuery, { emitEvent: false });
    }

    // Cargar datos solo si la cache no es válida
    this.heroesService.loadAll();

    // Filtro con debounce — persiste en el servicio
    this.filterControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((value) => {
        this.heroesService.searchByName(value);
      });
  }

  clearFilter(): void {
    this.filterControl.setValue('');
  }

  onPageChange(event: PageEvent): void {
    this.heroesService.setPageIndex(event.pageIndex);
    this.heroesService.setPageSize(event.pageSize);
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

    this._dialog
      .open(ConfirmDialogComponent, { width: '420px', data })
      .afterClosed()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.heroesService.delete(hero.id)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe(() => {
            this._snackBar.open(`${hero.name} eliminado`, 'Cerrar', { duration: 3000 });
          });
      });
  }
}