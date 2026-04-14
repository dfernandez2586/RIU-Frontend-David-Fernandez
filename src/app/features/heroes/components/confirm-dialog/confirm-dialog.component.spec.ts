import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from './confirm-dialog.component';

const DIALOG_DATA: ConfirmDialogData = {
  title: '¿Eliminar héroe?',
  message: '¿Estás seguro de que deseas eliminar a Superman?',
};

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let component: ConfirmDialogComponent;
  let dialogRefSpy: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the dialog title', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector(
      '[mat-dialog-title]'
    );
    expect(title.textContent?.trim()).toBe(DIALOG_DATA.title);
  });

  it('should display the dialog message', () => {
    const msg: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(msg.textContent?.trim()).toBe(DIALOG_DATA.message);
  });

  it('confirm() should close the dialog with true', () => {
    component.confirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('cancel() should close the dialog with false', () => {
    component.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });

  it('clicking Eliminar button should call confirm()', () => {
    const confirmSpy = vi.spyOn(component, 'confirm');

    const btn = fixture.debugElement
      .queryAll(By.css('button'))
      .find((b) => b.nativeElement.textContent.includes('Eliminar'));

    btn?.nativeElement.click();

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('clicking Cancelar button should call cancel()', () => {
    const cancelSpy = vi.spyOn(component, 'cancel');

    const btn = fixture.debugElement
      .queryAll(By.css('button'))
      .find((b) => b.nativeElement.textContent.includes('Cancelar'));

    btn?.nativeElement.click();

    expect(cancelSpy).toHaveBeenCalled();
  });
});