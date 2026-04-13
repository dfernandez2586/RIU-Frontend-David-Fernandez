import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingService } from '../../../features/heroes/services/loading/loading.service';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerComponent>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    loadingService = TestBed.inject(LoadingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render the overlay when loading is false', () => {
    const overlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(overlay).toBeNull();
  });

  it('should render the overlay when loading is true', () => {
    loadingService.show();
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(overlay).not.toBeNull();
  });

  it('should hide the overlay after hide() is called', () => {
    loadingService.show();
    fixture.detectChanges();
    loadingService.hide();
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(overlay).toBeNull();
  });

  it('overlay should have the correct aria-label', () => {
    loadingService.show();
    fixture.detectChanges();
    const overlay: HTMLElement =
      fixture.nativeElement.querySelector('.loading-overlay');
    expect(overlay.getAttribute('aria-label')).toBe('Cargando...');
  });
});