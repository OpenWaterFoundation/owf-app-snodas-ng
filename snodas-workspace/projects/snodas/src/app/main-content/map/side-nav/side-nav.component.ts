import { Component,
          EventEmitter,
          Input,
          OnInit, 
          Output}               from '@angular/core';

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
export class SideNavComponent implements OnInit {
  /**
   * 
   */
  public allBasins: string[];
  /**
   * The array of dates from the ListOfDates.txt file.
   */
  public allDates: string[];
  /**
   * 
   */
  public isBasinSelected = false;
  /**
   * The current date retrieved from the parent MapComponent to be displayed in a human-readable format.
   */
  @Input() currentDateDisplay: string;

  @Input() events: Observable<void>;

  private eventsSubscription$: Subscription;
  /**
   * The minimum date a user can choose in the date picker.
   */
  public minDate = new Date(2017, 0);
  /**
   * 
   */
  public maxDate = new Date(2017, 3, 7);
  /**
   * The filtered array of basins returned after a user searches for a basin in the Select Basin Map Input.
   */
  public selectedBasins: string[];
  /**
   * 
   */
  public selectedBasinID: string;
  /**
   * 
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
   * 
   */
  @Output() updateBasinFunction = new EventEmitter<any>();
  /**
   * 
   */
  @Output() updateFileFunction = new EventEmitter<any>();
  /**
   * The windowManager instance, whose job it will be to create, maintain, and remove multiple open dialogs from the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();


  constructor(private appService: AppService,
              public dialog: MatDialog) {

    this.allDates = this.appService.getDatesDashes();
    this.selectedDates = this.allDates;
  }


  /**
   * 
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
   * 
   * @param input 
   */
   public callUpdateFile(input: string): void {
    this.updateFileFunction.emit(input);
  }

  /**
   * 
   * @param graphType 
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
   * 
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
    })
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

}
