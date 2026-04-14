import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { By } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the router-outlet', () => {
    const outlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(outlet).not.toBeNull();
  });

  it('should render the spinner component', () => {
    const spinner = fixture.nativeElement.querySelector('app-spinner');
    expect(spinner).not.toBeNull();
  });

  it('should render the main container', () => {
    const main = fixture.nativeElement.querySelector('main.app-container');
    expect(main).not.toBeNull();
  });
});
