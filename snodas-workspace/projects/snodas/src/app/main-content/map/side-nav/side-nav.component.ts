import { Component,
          Input,
          OnInit }    from '@angular/core';
import { AppService } from '../../../app.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  /**
   * 
   */
  public allBasins: string[] = ['basin1', 'basin2', 'basin3'];
  /**
   * The current date retrieved from the parent MapComponent to be displayed in a human-readable format.
   */
  @Input() currentDateDisplay: string;
  /**
   * The array of dates from the ListOfDates.txt file.
   */
  public allDates: string[];
  /**
   * The minimum date a user can choose in the date picker.
   */
  public minDate = new Date(2017, 0);
  /**
   * 
   */
  public maxDate = new Date(2017, 3, 7);
  /**
   * The date selected from the Select Date Form Field dropdown menu.
   */
  public selectedDate: string;
  /**
   * The filtered array? of dates returned after a user searches for a date in the Select Date Mat Input.
   */
  public selectedDates: any;


  constructor(private appService: AppService) {
    this.allDates = this.appService.getDatesDashes();
    this.selectedDates = this.allDates;
  }


  ngOnInit(): void {
    setTimeout(() => {
      console.log(this.appService.getDatesDashes());
    });
  }

  /**
   * 
   * @param value The value typed in to the Mat Input field for the search.
   */
  public userInput(value: string) {
    this.selectedDates = this.searchDates(value);
  }

  /**
   * 
   * @param value The value typed in to the Mat Input field for the search.
   */
  private searchDates(value: string): any {
    console.log(value);
    let filter = value.toLowerCase();
    return this.allDates.filter((option: string) => {
      option.toLowerCase().startsWith(filter);
    })
  }

}
