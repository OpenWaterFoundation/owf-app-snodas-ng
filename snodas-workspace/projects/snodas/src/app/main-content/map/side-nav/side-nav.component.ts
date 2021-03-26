import { Component,
          EventEmitter,
          Input,
          OnDestroy,
          OnInit, 
          Output}               from '@angular/core';
import { FormGroup,
          FormGroupDirective,
          FormControl,
          NgForm,
          Validators }          from '@angular/forms';
import { ErrorStateMatcher }    from '@angular/material/core';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef }        from '@angular/material/dialog';

import { DialogImageComponent } from '@openwaterfoundation/common/ui/dialog';
import { WindowManager,
          WindowType }          from '@openwaterfoundation/common/ui/window-manager';

import { Observable,
          Subscription }        from 'rxjs';

import { AppService }           from '../../../app.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit, OnDestroy {
  /**
   * Array holding the original list of basins. For use with the basin search bar 
   */
  public allBasins: string[];
  /**
   * The array of dates from the ListOfDates.txt file.
   */
  public allDates: string[];
  /**
   * Boolean describing whether the animation button has been clicked.
   */
  // public animationSubmit: boolean;
  /**
   * A FormGroup for the animation expansion panel. Consists of
   * startDate    - The starting date selected or typed into the Mat Datepicker input field.
   * endDate      - The ending date selected or typed into the Mat Datepicker input field.
   * dayIncrement - The amount of days the animation will increment by.
   */
  public dateRange = new FormGroup({
    startDate: new FormControl(Validators.required),
    endDate: new FormControl(Validators.required),
    dayIncrement: new FormControl(1, Validators.required)
  });
  /**
   * The current date retrieved from the parent MapComponent to be displayed in a human-readable format.
   */
  @Input() currentDateDisplay: string;
  /**
   * 
   */
  public errorMatcher = new MyErrorStateMatcher();
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
  /**
   * Boolean describing whether a basin has been clicked.
   */
  public isBasinSelected = false;
  /**
   * The earliest date a user can choose in the date picker.
   */
  // TODO: jpkeahey - 2021.3.25: Update to take the earliest date from the ListOfDates.txt file.
  public minDate = new Date(2017, 0);
  /**
   * The latest date a user can choose in the date picker.
   */
  // TODO: jpkeahey - 2021.3.25: Update to take the latest date from the ListOfDates.txt file.
  public maxDate = new Date(2017, 3, 7);
  /**
   * The filtered array of basins returned after a user searches for a basin in the Select Basin Map Input.
   */
  public selectedBasins: string[];
  /**
   * The currently selected basin ID on the map.
   */
  public selectedBasinID: string;
  /**
   * The currently selected name of the basin on the map.
   */
  public selectedBasinName: string;
  /**
   * The date selected from the Select Date Form Field dropdown menu.
   */
  public selectedDate: string;
  /**
   * The filtered array of dates returned after a user searches for a date in the Select Date Mat Input.
   */
  public selectedDates: string[];
  /**
   * The feature object retrieved from the basin boundaries geoJSON file.
   */
  @Input() SNODAS_Geometry: any;
  /**
   * EventEmitter that alerts the Map component (parent) that an update has happened, and sends the basin name.
   */
  @Output() updateBasinFunction = new EventEmitter<any>();
  /**
   * EventEmitter that alerts the Map component (parent) that an update has happened, and sends the date.
   */
  @Output() updateFileFunction = new EventEmitter<any>();
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
              public dialog: MatDialog) {

    this.allDates = this.appService.getDatesDashes();
    this.selectedDates = this.allDates;
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
   public callUpdateFile(date: string): void {
    this.updateFileFunction.emit(date);
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

      fullImagePath = 'http://snodas.cdss.state.co.us/app/SnowpackGraphsByBasin/' + this.selectedBasinID + graphType;
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
      maxHeight: "65vh",
      maxWidth: "80vw"
    });
    this.windowManager.addWindow(windowID, WindowType.DOC);
  }
  
  /**
   * 
   */
  public playAnimation(): void {
    console.log(this.dateRange.value.startDate);
    console.log(this.dateRange.value.endDate);
    console.log(this.dateRange.value.dayIncrement);
  }
  
  /**
   * 
   */
  public pauseAnimation(): void {

  }
  
  /**
   * 
   */
  public restartAnimation(): void {

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

}

/**
 * Error class for when invalid control is dirty, touched, or submitted. This overrides default error display settings
 * and will show errors instantly.
 */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}