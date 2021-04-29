import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'menuDisable'
})
export class MenuDisablePipe implements PipeTransform {
  /**
   * Decides if a button or group of buttons are disabled depending on given arguments.
   * @param value The first argument given to the pipe. This is a boolean describing whether the field in question
   * has been populated, or possibly undefined.
   * @param pipeType Optional string describing the type of pipe currently being used. Options can be play, pause, and restart.
   * @param complete Optional boolean showing whether the animation has been completed.
   * @param playing Optional boolean showing whether the animation is currently playing.
   * @returns A boolean describing whether to enable or disable the given button.
   */
  transform(active: boolean, pipeType?: string, complete?: boolean, playing?: boolean): unknown {
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
    } else if (pipeType === 'pause') {
      if (active === true || complete === true) {
        return true;
      } else if (playing === true) {
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
