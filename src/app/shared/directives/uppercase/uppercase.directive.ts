import {
  Directive,
  HostListener,
  ElementRef,
  inject,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[appUppercase]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UppercaseDirective),
      multi: true,
    },
  ],
})
export class UppercaseDirective implements ControlValueAccessor {
  private readonly _el = inject(ElementRef);

  private _onChange: (value: string) => void = () => {};
  private _onTouched: () => void = () => {};

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    input.value = upper;
    this._onChange(upper);
  }

  @HostListener('blur')
  onBlur(): void {
    this._onTouched();
  }

  writeValue(value: string): void {
    this._el.nativeElement.value = value ? value.toUpperCase() : '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._el.nativeElement.disabled = isDisabled;
  }
}