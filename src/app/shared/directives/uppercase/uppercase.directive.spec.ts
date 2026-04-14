import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { UppercaseDirective } from './uppercase.directive';

@Component({
  standalone: true,
  imports: [UppercaseDirective, ReactiveFormsModule],
  template: `<input appUppercase [formControl]="nameControl" />`,
})
class TestHostComponent {
  nameControl = new FormControl('');
}

describe('UppercaseDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let inputEl: HTMLInputElement;
  let component: TestHostComponent;
  let directive: UppercaseDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    directive = fixture.debugElement
      .query(By.directive(UppercaseDirective))
      .injector.get(UppercaseDirective);
  });

  it('should be created', () => {
    expect(directive).toBeTruthy();
  });

  it('should convert typed text to uppercase', () => {
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

  it('writeValue() should set input value in uppercase', () => {
    component.nameControl.setValue('superman');
    fixture.detectChanges();
    expect(inputEl.value).toBe('SUPERMAN');
  });

  it('writeValue() with null/empty should set empty string', () => {
    component.nameControl.setValue(null);
    fixture.detectChanges();
    expect(inputEl.value).toBe('');
  });

  it('should mark control as touched on blur', () => {
    expect(component.nameControl.touched).toBeFalsy();
    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.nameControl.touched).toBeTruthy();
  });

  it('setDisabledState() should disable the input', () => {
    component.nameControl.disable();
    fixture.detectChanges();
    expect(inputEl.disabled).toBeTruthy();
  });

  it('setDisabledState() should re-enable the input', () => {
    component.nameControl.disable();
    fixture.detectChanges();
    component.nameControl.enable();
    fixture.detectChanges();
    expect(inputEl.disabled).toBeFalsy();
  });

  it('registerOnChange() should store and call the provided function', () => {
    const fn = vi.fn();
    directive.registerOnChange(fn);
    inputEl.value = 'hulk';
    inputEl.dispatchEvent(new Event('input'));
    expect(fn).toHaveBeenCalledWith('HULK');
  });

  it('registerOnTouched() should store and call the provided function', () => {
    const fn = vi.fn();
    directive.registerOnTouched(fn);
    inputEl.dispatchEvent(new Event('blur'));
    expect(fn).toHaveBeenCalled();
  });
});