import { Injectable }        from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { MatDateFormats }    from '@angular/material/core';


/**
 * A custom date adapter that formats the output of the Material Date Ranges, so instead of displaying the common
 * MM/DD/YYYY to a user, the ISO 8601 format YYYY-MM-DD will be used instead. This is set in the providers array in the top
 * level app module. Adding this directly to the Component using the data picker would also work, under the `@Component`
 * decorator.
 */
@Injectable()
export class AppDateAdapter extends NativeDateAdapter {

  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      // date.setDate(date.getDate() + 1);
      let day: string = date.getDate().toString();
      day = +day < 10 ? '0' + day : day;
      let month: string = (date.getMonth() + 1).toString();
      month = +month < 10 ? '0' + month : month;
      let year = date.getFullYear();
      return `${year}-${month}-${day}`;
    }
    return date.toDateString();
  }

}

export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { month: 'numeric', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  }
};