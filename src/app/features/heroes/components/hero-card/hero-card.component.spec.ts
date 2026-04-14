import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { HeroCardComponent } from './hero-card.component';
import { Hero } from '../../models/hero.model';

const MOCK_HERO: Hero = {
  id: '1',
  name: 'SUPERMAN',
  alias: 'Clark Kent',
  power: 'Super fuerza, vuelo',
  universe: 'DC',
  createdAt: new Date(),
};

describe('HeroCardComponent', () => {
  let fixture: ComponentFixture<HeroCardComponent>;
  let component: HeroCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroCardComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('hero', MOCK_HERO);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hero name', () => {
    const name: HTMLElement = fixture.nativeElement.querySelector('.hero-name');
    expect(name?.textContent?.trim()).toBe(MOCK_HERO.name);
  });

  it('should display hero alias', () => {
    const alias: HTMLElement = fixture.nativeElement.querySelector('.hero-alias');
    expect(alias?.textContent?.trim()).toBe(MOCK_HERO.alias);
  });

  it('should display hero power', () => {
    const power: HTMLElement = fixture.nativeElement.querySelector('.hero-power');
    expect(power?.textContent?.trim()).toBe(MOCK_HERO.power);
  });

  it('should display hero universe as badge', () => {
    const badge: HTMLElement = fixture.nativeElement.querySelector('.universe-badge');
    expect(badge?.textContent?.trim()).toBe(MOCK_HERO.universe);
  });

  it('should apply correct universe style for DC', () => {
    expect(component.universeStyle.bg).toBe('#e8eeff');
    expect(component.universeStyle.color).toBe('#2c3e9e');
  });

  it('should emit editClicked when edit button is clicked', () => {
    let emitted: Hero | undefined;
    component.editClicked.subscribe((h) => (emitted = h));

    const editBtn = fixture.debugElement
      .queryAll(By.css('button'))
      .find((b) => b.nativeElement.getAttribute('aria-label')?.includes('Editar'));

    editBtn?.nativeElement.click();
    expect(emitted).toEqual(MOCK_HERO);
  });

  it('should emit deleteClicked when delete button is clicked', () => {
    let emitted: Hero | undefined;
    component.deleteClicked.subscribe((h) => (emitted = h));

    const deleteBtn = fixture.debugElement
      .queryAll(By.css('button'))
      .find((b) => b.nativeElement.getAttribute('aria-label')?.includes('Eliminar'));

    deleteBtn?.nativeElement.click();
    expect(emitted).toEqual(MOCK_HERO);
  });
});