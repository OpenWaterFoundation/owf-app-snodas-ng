import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'menuDisable'
})
export class MenuDisablePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return !value;
  }

}
