import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCoordinateValidator]'
})
export class CoordinateValidatorDirective {
  @Input('appCoordinateValidator') coordinateType!: 'latitude' | 'longitude';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    if (!/^[-]?\d*[.,]?\d*$/.test(value)) {
      input.value = input.value.slice(0, -1);
    }
  }

  @HostListener('blur', ['$event']) onBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = parseFloat(input.value.replace(',', '.'));

    if (isNaN(value)) {
      value = this.coordinateType === 'latitude' ? 0 : 0;
    }

    if (this.coordinateType === 'latitude') {
      if (value < -90) value = -90;
      if (value > 90) value = 90;
    } else if (this.coordinateType === 'longitude') {
      if (value < -180) value = -180;
      if (value > 180) value = 180;
    }

    input.value = value.toString();
  }
}
