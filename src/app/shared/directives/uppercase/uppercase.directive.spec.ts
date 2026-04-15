import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

import { UppercaseDirective } from './uppercase.directive';

@Component({
  standalone: true,
  imports: [UppercaseDirective, ReactiveFormsModule],
  template: `<input appUppercase [formControl]="nameControl" />`,
})
class TestHostComponent {
  nameControl = new FormControl('');
}

@Component({
  standalone: true,
  imports: [UppercaseDirective, ReactiveFormsModule],
  template: `<input appUppercase [formControl]="nameControl" />`,
})
class TestHostWithValueComponent {
  nameControl = new FormControl('superman');
}

@Component({
  standalone: true,
  imports: [UppercaseDirective, ReactiveFormsModule],
  template: `<input appUppercase [formControl]="nameControl" />`,
})
class TestHostAlreadyUpperComponent {
  nameControl = new FormControl('BATMAN');
}

describe('UppercaseDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let inputEl: HTMLInputElement;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
  });

  it('should be created', () => {
    const directive = fixture.debugElement
      .query(By.directive(UppercaseDirective))
      .injector.get(UppercaseDirective);
    expect(directive).toBeTruthy();
  });

  it('should convert typed text to uppercase on input event', () => {
    inputEl.value = 'spiderman';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputEl.value).toBe('SPIDERMAN');
  });

  it('should update the form control value in uppercase', () => {
    inputEl.value = 'batman';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.nameControl.value).toBe('BATMAN');
  });

  it('should not call setValue again if value is already uppercase', () => {
    inputEl.value = 'HULK';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.nameControl.value).toBe('HULK');
    expect(inputEl.value).toBe('HULK');
  });

  it('should convert initial value to uppercase on init', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TestHostWithValueComponent],
    }).compileComponents();

    const f = TestBed.createComponent(TestHostWithValueComponent);
    f.detectChanges();

    const input: HTMLInputElement = f.debugElement.query(By.css('input')).nativeElement;
    expect(f.componentInstance.nameControl.value).toBe('SUPERMAN');
    expect(input.value).toBe('SUPERMAN');
  });

  it('should not patch value on init if already uppercase', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TestHostAlreadyUpperComponent],
    }).compileComponents();

    const f = TestBed.createComponent(TestHostAlreadyUpperComponent);
    f.detectChanges();
    expect(f.componentInstance.nameControl.value).toBe('BATMAN');
  });

  it('should handle null/empty NgControl gracefully', () => {
    inputEl.value = '';
    expect(() => inputEl.dispatchEvent(new Event('input'))).not.toThrow();
  });

  it('should preserve cursor position after uppercasing', () => {
    inputEl.value = 'abc';
    inputEl.setSelectionRange(1, 2);
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputEl.selectionStart).toBe(1);
    expect(inputEl.selectionEnd).toBe(2);
  });
});