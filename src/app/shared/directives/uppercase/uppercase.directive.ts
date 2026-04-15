import { Directive, HostListener, inject, OnInit, DestroyRef } from '@angular/core';
import { NgControl } from '@angular/forms';


@Directive({
  selector: 'input[appUppercase]',
  standalone: true,
})
export class UppercaseDirective implements OnInit {
  private readonly _control = inject(NgControl, { self: true, optional: true });

  ngOnInit(): void {
    if (!this._control?.control) return;

    const current = this._control.control.value;
    if (typeof current === 'string' && current !== current.toUpperCase()) {
      this._control.control.setValue(current.toUpperCase(), { emitEvent: false });
    }
  }

  @HostListener('input', ['$event.target'])
  onInput(target: EventTarget | null): void {
    if (!this._control?.control || !(target instanceof HTMLInputElement)) return;

    const input = target;

    const upper = input.value.toUpperCase();
    if (input.value !== upper) {
      const start = input.selectionStart ?? upper.length;
      const end = input.selectionEnd ?? upper.length;
      input.value = upper;
      input.setSelectionRange(start, end);
    }

    this._control.control.setValue(upper, { emitEvent: true });
  }
}