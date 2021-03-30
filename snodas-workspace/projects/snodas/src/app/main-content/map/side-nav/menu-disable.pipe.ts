import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'menuDisable'
})
export class MenuDisablePipe implements PipeTransform {
  /**
   * Given a boolean describing whether an event or action has been performed, decides if a button or group of buttons
   * are disabled or not.
   * @param value The first argument given to the pipe. This is a boolean describing whether the field in question
   * has been populated, or possibly undefined.
   * @param args All subsequent arguments, if given.
   * @returns The opposite of the boolean given in the value variable.
   */
  transform(active: boolean, pipeType?: string, complete?: boolean): unknown {
    // Check to see if the optional play argument is defined. If the animation is playing, then disable the play button.
    if (pipeType === 'play') {
      return active;
    } else if (pipeType === 'restart') {
      if (!active) {
        if (complete === true) {
          return false;
        } else {
          return true;
        }
      } else if (complete === true) {
        return false;
      } else if (active === true) {
        return false;
      }
    }
    // Variable animationPaused has not yet been set.
    if (!active) {
      return true;
    }

    return !active;
  }

}
