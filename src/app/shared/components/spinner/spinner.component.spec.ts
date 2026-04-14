import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpinnerComponent } from './spinner.component';
import { LoadingService } from '../../../core/interceptors/loading.service';

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerComponent>;
  let component: SpinnerComponent;
  let _loading: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    _loading = signal(false);

    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [
        {
          provide: LoadingService,
          useValue: { loading: _loading.asReadonly() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should NOT render overlay when loading is false', () => {
    const overlay = fixture.nativeElement.querySelector('.overlay');
    expect(overlay).toBeNull();
  });

  it('should render overlay when loading is true', async () => {
    _loading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const overlay = fixture.nativeElement.querySelector('.overlay');
    expect(overlay).not.toBeNull();
  });
});