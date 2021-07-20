import { Component,
          EventEmitter,
          Input,
          OnDestroy,
          OnInit, 
          Output,
          ViewChild }               from '@angular/core';
import { AbstractControl,
          FormControl,
          FormBuilder,
          Validators,
          ValidatorFn }             from '@angular/forms';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef }            from '@angular/material/dialog';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { DialogImageComponent }     from '@openwaterfoundation/common/ui/dialog';
import { WindowManager,
          WindowType }              from '@openwaterfoundation/common/ui/window-manager';

import { Observable,
          Subscription }            from 'rxjs';

import { AppService }               from '../../../app.service';


@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit, OnDestroy {
  /** Array holding the original list of basins. For use with the basin search bar */
  public allBasins: string[];
  /** The array of dates from the ListOfDates.txt file. */
  public allDates: string[];
  /** Whether the animation has completed, and has not been restarted yet. */
  public animationCompleted = false;
  /** The last date to be shown in the animation. */
  public animationEndDate: string;
  /**
   * The last index to be used for the end date. Since dates are ordered from most recent to earliest dates, this index will
   * be smaller than the animationIndex.
   */
  public animationEndIndex: number;
  /**
   * A FormGroup built by the formBuilder used by the animation expansion panel. Consists of
   * startDate    - The starting date selected or typed into the Mat Datepicker input field. Is required and must be a date
   *                in-between 2003-09-30 to present day, and before the endDate.
   * endDate      - The ending date selected or typed into the Mat Datepicker input field. Is required and must be a date in-
   *                between 2003-09-30 to present day, and after the startDate.
   * dayIncrement - The amount of days the animation will increment by. Is required and must be an integer.
   */
  public animationForm = this.formBuilder.group({
    startDate: new FormControl('', [Validators.required, this.validateStartDate()]),
    endDate: new FormControl('', [Validators.required, this.validateEndDate()]),
    dayIncrement: new FormControl(1, [Validators.required, Validators.pattern('[0-9]+')])
  })
  /** The starting index to represent where in the animation subset array  */
  public animationIndex: number;
  /** The ID value of the animation setInterval. Used as a reference to stop the timer. */
  public animationInterval: any;
  /** Whether the animation is currently paused. */
  public animationPaused: boolean;
  /** Whether the animation is currently playing. */
  public animationPlaying = false;
  /** The value as a percent to increment the slider by starting at 0 and ending close to 100. */
  public animationSliderInc: number;
  /** The first date to be shown in the animation. */
  public animationStartDate: string;
  /** The amount of days the animation will increment by. */
  public animationStep: number;
  /**
   * The reference to the virtual scroll viewport in the template file by using the @ViewChild decorator. The change detector
   * looks for the first element or directive matching the selector in the view DOM, and if it changes, the property is updated.
   */
  @ViewChild(CdkVirtualScrollViewport, { static: false }) cdkVirtualScrollViewPort: CdkVirtualScrollViewport;
  /** The current date retrieved from the parent MapComponent to be displayed in a human-readable format. */
  @Input() currentDateDisplay: string;
  /**
   * Array of supported quick pick date ranges. The default is no date range.
   */
  public readonly dateRangeChoice: any[] = [
    { title: '----', fillType: '', tooltip: '' },
    {
      title: 'Current calendar year',
      fillType: 'calYear',
      tooltip: 'Fill date range from ' + this.convertDateToString(this.createDate('calYear')) + ' to current day'
    },
    {
      title: 'Current water year',
      fillType: 'waterYear',
      tooltip: 'Fill date range from ' + this.convertDateToString(this.createDate('waterYear')) + ' to current day'
    }
  ]
  /**
   * 
   */
  public errorMessages = {
    badDate: 'Invalid Date',
    required: 'Required'
  }
  /**
   * Subscription to an event using data binding in the Map Component (parent) template file. Receives the
   * Local_Id as an event when a basin is clicked on.
   */
  @Input() events: Observable<void>;
  /**
   * Variable representing the subscription to the Input() events above. Used to easily unsubscribe when
   * this component is destroyed.
   */
  private eventsSubscription$: Subscription;
  /** Boolean describing whether a basin has been clicked. */
  public isBasinSelected = false;
  /** The earliest date a user can choose in the date picker. */
  public minDate: Date;
  /** The latest date a user can choose in the date picker. */
  public maxDate: Date;

  public restartClicked: boolean;
  /** The filtered array of basins returned after a user searches for a basin in the Select Basin Map Input. */
  public selectedBasins: string[];
  /** The currently selected basin ID on the map. */
  public selectedBasinID: string;
  /** The currently selected name of the basin on the map. */
  public selectedBasinName: string;
  /** The date selected from the Select Date Form Field dropdown menu. */
  public selectedDate: string;
  /** The filtered array of dates returned after a user searches for a date in the Select Date Mat Input. */
  public selectedDates: string[];
  /** The initial value of the animation slider. */
  public sliderValue = 0;
  /** The feature object retrieved from the basin boundaries geoJSON file. */
  @Input() SNODAS_Geometry: any;
  /** EventEmitter that alerts the Map component (parent) that an update has happened, and sends the basin name. */
  @Output() updateBasinFunction = new EventEmitter<any>();
  /** EventEmitter that alerts the Map component (parent) that an update has happened, and sends the date. */
  @Output() updateMapDateFunction = new EventEmitter<any>();
  /**
   * The windowManager instance, whose job it will be to create, maintain, and remove multiple open dialogs from the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * 
   * @param appService 
   * @param dialog 
   */
  constructor(private appService: AppService,
              private formBuilder: FormBuilder,
              public dialog: MatDialog) {
    // Set all dates from the list of dates set in the App Service, then set the input/search-used selectedDates array.
    this.allDates = this.appService.getDatesDashes();
    this.selectedDates = this.allDates;
    // Retrieve and set the min and max dates for the animation.
    this.minDate = this.appService.getFirstLegalDate();
    this.maxDate = this.appService.getLastLegalDate();
  }

  /**
   * Called when a mat-option is clicked from the Basin Mat Form Field. It sends data back to the Map component
   * with the basin name so the map and necessary Leaflet controls can be updated.
   * @param fullBasinName The basin name and id in a string, e.g. BASIN NAME (BasinID)
   */
  public callUpdateBasin(fullBasinName: string): void {
    // Enable graph buttons
    this.isBasinSelected = true;
    this.selectedBasinID = fullBasinName.slice(fullBasinName.indexOf('(') + 1, fullBasinName.indexOf(')'));
    this.selectedBasinName = this.getBasinName(this.selectedBasinID);
    this.updateBasinFunction.emit(fullBasinName);
  }

  /**
   * Called when mat-option is clicked from the Date Mat Form Field. It sends data back to the Map component
   * with the date so the map and necessary Leaflet controls can be updated.
   * @param date The date a user has selected.
   */
   public callUpdateMapDate(date: string): void {
    this.updateMapDateFunction.emit(date);
  }

  /**
   * Converts a Date object from the Material datepicker into the `YYYY-MM-DD` format to correctly find it in the array created
   * from the `ListOfDates.txt` file.
   * @param date The Date object to convert to a string that matches the date format in the `ListOfDates.txt` file.
   * @returns A string in the format `YYYY-MM-DD`.
   */
  private convertDateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Create a new date instance, set to a day dependant on the fillType, with a timezone offset.
   * @param fillType The type of date to create, e.g. calYear, waterYear, etc.
   * @returns A new timezone offset date based on the fillType
   */
  public createDate(dateType: string): Date {
    var date = new Date();

    switch(dateType) {
      case '':
        return this.offsetDate(date);
      case 'calYear':
        date.setMonth(0);
        date.setDate(1);
        return this.offsetDate(date);
      case 'waterYear':
        date.setFullYear(date.getFullYear() - 1);
        date.setMonth(9);
        date.setDate(1);
        return this.offsetDate(date);
    }
  }

  /**
   * 
   * @param startDateInput 
   * @param endDateInput 
   * @param fillType 
   */
  public fillDateRange(startDateInput: any, endDateInput: any, fillType: string): void {

    var today = this.createDate('');

    switch(fillType) {
      case 'calYear':
        var calYear = this.createDate('calYear');
        // Set the start and end date values in the animation form.
        this.animationForm.get('startDate').setValue(this.convertDateToString(calYear));
        this.animationForm.get('endDate').setValue(this.convertDateToString(today));
        startDateInput.value = this.convertDateToString(calYear);
        endDateInput.value = this.convertDateToString(today);
        break;
      case 'waterYear':
        var waterYear = this.createDate('waterYear');
        // Set the start and end date values in the animation form.
        this.animationForm.get('startDate').setValue(this.convertDateToString(waterYear));
        this.animationForm.get('endDate').setValue(this.convertDateToString(today));
        startDateInput.value = this.convertDateToString(waterYear);
        endDateInput.value = this.convertDateToString(today);
        break;
      default:
        break;
    }
  }

  /**
   * 
   * @param control 
   * @returns 
   */
  public formErrors(control: AbstractControl): string[] {
    return control.errors ? Object.keys(control.errors) : [];
  }

  /**
   * 
   * @param value 
   * @returns 
   */
  public formatLabel(value: any): any {
    return value;
  }

  /**
   * Takes in a basin id and searches through SNODAS_Geometry object to find the local name of the basin.
   * @param id The basin ID
   * @returns The basin name as a string.
   */
  private getBasinName(id: any) {
    for(let index in this.SNODAS_Geometry.features) {
      if(this.SNODAS_Geometry.features[index]["properties"]["LOCAL_ID"] == id) {
          return this.SNODAS_Geometry.features[index]["properties"]["LOCAL_NAME"];
      }
    }
  }

  /**
   * Called after the constructor, initializing input properties, and the first call to ngOnChanges.
   */
  ngOnInit(): void {
    // Format all dates so they are similar to ISO 8601 formatting with dashes.
    this.allBasins = this.appService.formatBasins(this.SNODAS_Geometry);
    // Create a deep copy of the original all basins array 
    this.selectedBasins = this.allBasins.slice();

    this.eventsSubscription$ = this.events.subscribe((basinID: any) => {
      this.isBasinSelected = true;
      this.selectedBasinID = basinID;
      this.selectedBasinName = this.getBasinName(basinID);
    });
  }
  
  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    this.eventsSubscription$.unsubscribe();    
  }

  /**
   * Takes a Date object and manipulates the timezone so that if a user in Denver (MT) chooses an option that contains the
   * first day of the year, it won't create a Date object that's a day before or ahead of the January 1st.
   * @param date The date to offset according to user timezone.
   * @returns A Date object with the user's timezone offset applied to the original Date.
   */
  private offsetDate(date: Date): Date {
    var userTZOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTZOffset);
  }

  /**
   * Constructs and opens a Material Dialog with a single, resizable image as the contents.
   * @param graphType String representing what kind of graph to display, e.g. -SNODAS-SWE-Volume.png
   */
   public openImageDialog(graphType: string): void {
    var windowID = 'dialog-image' + this.selectedBasinID + graphType;
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var fullImagePath: string;
    if (graphType === '-SNODAS-SWE-Volume.png' ||
        graphType === 'UpstreamTotal-SNODAS-SWE-Volume.png' ||
        isNaN(parseInt(this.selectedBasinID))) {

      fullImagePath = 'https://snodas.cdss.state.co.us/data/SnowpackGraphsByBasin/' + this.selectedBasinID + graphType;
    } else {
      fullImagePath = 'assets/SnowpackGraphsByBasin/' + this.selectedBasinID + graphType;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogID: windowID,
      imagePath: fullImagePath,
      imageDescription: ''
    }
    const dialogRef: MatDialogRef<DialogImageComponent, any> = this.dialog.open(DialogImageComponent, {
      data: dialogConfig,
      // This stops the dialog from containing a backdrop, which means the background opacity is set to 0, and the
      // entire InfoMapper is still navigable while having the dialog open. This way, you can have multiple dialogs
      // open at the same time.
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "800px",
      width: "900px",
      minHeight: "560px",
      minWidth: "525px",
      maxHeight: "90vh",
      maxWidth: "80vw"
    });
    this.windowManager.addWindow(windowID, WindowType.DOC);
  }

  /**
   * Whenever the mat-select field is clicked, check if the event exists and use the @ViewChild decorated class variable to check
   * the size of the viewport and scroll to the first element; this way, the viewport will always start there.
   */
  public openSelectChange($event: any): void {
    if ($event) {
      this.cdkVirtualScrollViewPort.scrollToIndex(0);
      this.cdkVirtualScrollViewPort.checkViewportSize();
    }
  }
  
  /**
   * Obtains the data entered from the mat-form-field under the animation and sets up and runs the animation on the map
   * in set intervals.
   */
  public playAnimation(): void {
    // Check to see if all the form fields are entered correctly, and if not, don't do anything.
    if (this.animationForm.value.startDate instanceof Function || this.animationForm.value.endDate instanceof Function ||
        !Number.isInteger(Number(this.animationForm.value.dayIncrement))) {
      return;
    }
    // Check if the dates given are within the animation boundaries, and if not, don't do anything.
    if (this.animationForm.value.startDate < this.minDate || this.animationForm.value.endDate > this.maxDate) {
      return;
    }

    // Use the side-nav instance to assign to _this so it can be used in the setInterval function.
    var _this = this;

    this.animationCompleted = false;

    if (this.animationPaused === undefined || this.animationPaused === false) {
      // Reset the slider's value to 0.
      this.sliderValue = 0;

      if (this.restartClicked === true) {
        this.restartClicked = false;
        return;
      }
      // Convert the date to an ISO string so it can be searched for in the array of all dates from the ListOfDates.txt.
      this.animationStartDate = this.convertDateToString(new Date(this.animationForm.value.startDate));
      // Determine the index to start from in allDates.
      this.animationIndex = this.allDates.indexOf(this.animationStartDate);

      this.animationEndDate = this.convertDateToString(new Date(this.animationForm.value.endDate));
      this.animationEndIndex = this.allDates.indexOf(this.animationEndDate);

      // If one of the dates can't be found, don't do anything.
      if (this.animationIndex === -1 || this.animationEndIndex === -1) {
        console.log(this.allDates);
        return;
      }

      // The total amount of milliseconds between days. This is built into Date objects.
      var endDate = new Date(this.animationForm.value.endDate);
      var startDate = new Date(this.animationForm.value.startDate);
      var diffTime = endDate.getTime() - startDate.getTime();
      // The total amount of days the date range encapsulates by multiplying by milliseconds, seconds, minutes & days.
      var totalDays = Math.ceil(diffTime) / (1000 * 60 * 60 * 24) + 1;
      // The number of times the slider will step across the entire width by diving the total days by the day increment.
      var sliderStep = Math.ceil(totalDays / Number(this.animationForm.value.dayIncrement));
      // The number - or percent - to increase the slider by. The slider value can be a percent, which helps keep the movement
      // integrity on longer ranges. 
      this.animationSliderInc = 100 / sliderStep;
    } else {
      this.animationPaused = false;
    }
    
    // Call the map date function in the parent Map Component to update the map date and basins with each date
    // in the range of the animation. This will keep executing every N milliseconds until a conditional is met.
    this.animationInterval = setInterval(function() {
      // If the current animation index is less than the ending index, then end the interval.
      if (_this.animationIndex < _this.animationEndIndex) {
        _this.animationPlaying = false;
        _this.animationCompleted = true;
        clearInterval(_this.animationInterval);
        // Clearing the interval is not enough. It will keep executing the remaining code in this setInterval function, so
        // return from the function to stop that from happening.
        return;
      }

      _this.animationPlaying = true;
      // Update the mat slider value here. It's put in a timeout (har har) so that it and the map updates at the same time.
      // It actually needs to be slowed down so that it doesn't update faster than the map (which has to perform a GET request
      // every time new basins are shown). 200 seems to work okay for now.
      setTimeout(() => { 
        _this.sliderValue += _this.animationSliderInc;
      }, 200);
      
      // Update the map here.
      _this.updateMapDateFunction.emit(_this.allDates[_this.animationIndex]);
      // Move the animation index down by the incremented field.
      _this.animationIndex -= Number(_this.animationForm.value.dayIncrement);
    }, 1000);
  }
  
  /**
   * Pauses the animation by clearing the setInterval function that was started in the playAnimation function on a Play
   * button click.
   */
  public pauseAnimation(): void {
    clearInterval(this.animationInterval);
    this.animationPlaying = false;
    this.animationPaused = true;
  }
  
  /**
   * 
   */
  public restartAnimation(): void {
    this.animationPaused = false;
    this.restartClicked = true;
    this.playAnimation();
  }

  /**
   * Filters down the array being displayed under the search bar in the Select Basins mat-option drop down.
   * @param value The value typed in to the Mat Input field for the search.
   * @param key The name of the key pressed by the user.
   * @returns The filtered array of elements that contain the user-defined search term.
   */
  private searchBasins(value: string, key: string): any {
    // If the value in the search bar is empty, then all dates can be shown.
    if (value === '') {
      return this.allBasins;
    }

    let filter = value.toLowerCase();

    if (key.toLowerCase() === 'backspace') {
      this.selectedBasins = this.allBasins.filter((option: string) => {
        return option.toLowerCase().includes(filter);
      });
      return this.selectedBasins;
    } else {
      return this.selectedBasins.filter((option: string) => {
        return option.toLowerCase().includes(filter);
      });
    }
  }

  /**
   * Filters down the array being displayed under the search bar in the Select Dates mat-option drop down.
   * @param value The value typed in to the Mat Input field for the search.
   * @param key The name of the key pressed by the user.
   */
  private searchDates(value: string, key: string): any {
    // If the value in the search bar is empty, then all dates can be shown.
    if (value === '') {
      return this.allDates;
    }

    let filter = value.toLowerCase();

    if (key.toLowerCase() === 'backspace') {
      this.selectedDates = this.allDates.filter((option: string) => {
        return option.toLowerCase().includes(filter);
      });
      return this.selectedDates;
    } else {
      return this.selectedDates.filter((option: string) => {
        return option.toLowerCase().includes(filter);
      });
    }
    
  }

  /**
   * Calls either the searchDates or searchBasins function depending which search bar is being used.
   * @param event The KeyboardEvent object created every time a key is pressed by the user.
   */
   public userInput(event: any, inputType: string) {
    if (inputType === 'date') {
      this.selectedDates = this.searchDates(event.target.value, event.key);
    } else if (inputType === 'basin') {
      this.selectedBasins = this.searchBasins(event.target.value, event.key);
    }
  }

  /**
   * Validates the end date is a date, in-between September 30th, 2003 and present day, and greater than the start date.
   * @returns An object with the string badDate as the key, and the incorrect value as the value.
   * Otherwise null if no errors found. 
   */
   private validateEndDate(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      var endDate = new Date(control.value);
      var badDate = { badDate: control.value };

      if (endDate.toString() !== 'Invalid Date') {
        if (endDate < new Date('2003-09-30') || endDate > new Date()) {
          return badDate;
        } else if (new Date(this.animationForm.value.startDate).toString() !== 'Invalid Date') {
          return new Date(this.animationForm.value.startDate) > endDate ? badDate : null;
        } else {
          return null;
        }
      }
      return badDate;
    }
      
  }

  /**
   * Validates the start date is a date, in-between September 30th, 2003 and present day, and less than the end date.
   * @returns An object with the string badDate as the key, and the incorrect value as the value.
   * Otherwise null if no errors found. 
   */
  private validateStartDate(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      var startDate = new Date(control.value);
      var badDate = { badDate: control.value };

      if (startDate.toString() !== 'Invalid Date') {
        if (startDate < new Date('2003-09-30') || startDate > new Date()) {
          return badDate;
        } else if (new Date(this.animationForm.value.endDate).toString() !== 'Invalid Date') {
          return new Date(this.animationForm.value.endDate) < startDate ? badDate : null;
        } else {
          return null;
        }
      }
      return badDate;
    }
  }

  /**
   * Helper function that left pads a number by a given amount of places, e.g. num = 1, places = 2, returns 01
   * @param num The number that needs padding
   * @param places The amount the padding will go out to the left
   */
   private zeroPad(num: number, places: number) {    
    return String(num).padStart(places, '0');
  }

}
