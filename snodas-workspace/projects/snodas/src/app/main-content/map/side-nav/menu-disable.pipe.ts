import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'menuDisable'
})
export class MenuDisablePipe implements PipeTransform {
  /**
   * Given a boolean describing whether an event or action has been performed, decides if a button or group of buttons
   * are disabled or not.
   * @param value The first argument given to the pipe. This is a boolean describing whether the field in question
   * has been populated.
   * @param args All subsequent arguments, if given.
   * @returns The opposite of the boolean given in the value variable.
   */
  transform(value: unknown, ...args: unknown[]): unknown {
    return !value;
  }

}
