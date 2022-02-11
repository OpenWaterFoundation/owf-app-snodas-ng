import { Component,
          OnDestroy,
          OnInit, }     from '@angular/core';
import { Subject,
          Subscription,
          timer }       from 'rxjs';

import { AppService }   from '../../app.service';

import * as Papa        from 'papaparse';

// import * as L         from 'leaflet';
declare var L: any;


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  /** The background layer of the map. */
  public background: any;
  /** The Leaflet layer containing the Colorado boundary. */
  public COBoundary: any;
  /** The human readable version of the current date being displayed on the map. */
  public currentDateDisplay: string;
  /** Subject used to send information to the side-nav Component as an event when
   * a basin is clicked. */
  public eventsSubject: Subject<string> = new Subject<string>();
  /** The Leaflet `app-config.json` file subscription object to be unsubscribed from
   * upon component destruction. */
  private forkJoinSub$ = <any>Subscription;
  /** The main Leaflet map. */
  public mainMap: any;
  /** The app configuration object obtained from app-config.json. */
  public appConfig: any;
  /** GeoJSON layer containing the merged SNODAS basin boundary geoJSON file and
   * CSV file data of the basin by date. */
  public basinBoundaryWithData: any;
  /** Info panel on bottom left of the map. */
  public info: any;
  /** Date display on top left of the map. */
  public mapDate: any;
  /** The subscription object to hold one or all refresh subs to unsubscribe from
   * upon component destruction. */
  private refreshSub$ = new Subscription();
  /** The object containing the SNODAS basins data from the basinBoundaries property
   * in the `app-config.json` file. */
  public SNODAS_Geometry: any;
  /** Upper left zoom home map control. */
  public zoomHome: any;


  /**
   * @constructor Injects this component with the app service for network requests and global data.
   * @param appService The reference to the application service for retrieving data over the network and holding global data.
   */
  constructor(private appService: AppService) {

  }


  /**
   * 
   * @param currDate The current date displayed on the map.
   * @param basin 
   * @param defined 
   */
  private buildMap(currDate: any, basin: any, defined: boolean): void {

    var _this = this;
    // Set the current date in the app service. This could be the same date if for example, a basin is selected.
    this.appService.setCurrDate(currDate);

    // After the initial creation of the map, the COBoundary layer is stored in a class variable so it can be quickly added back
    // onto the map each time the buildMap function is called.
    if (this.COBoundary) {
      this.mainMap.addLayer(this.COBoundary);
      this.COBoundary.bringToBack();
    }

    // The CSV file to parse.
    var SNODASFile: string;
    // The temporary variable to hold the path/URL to the CSV file. To be manipulated for the displaying of the date.
    var temp: string;

    if (this.appService.getDevEnv() === true) {
      // This grabs the SNODAS data from the SnowpackbyDate_(CURRENT DATE).csv file. It then assigns that data to the
      // SNODAS_Statistics variable.
      SNODASFile = "assets/SnowpackStatisticsByDate/SnowpackStatisticsByDate_" + currDate + ".csv";
      // Build the string to be displayed
      temp = SNODASFile.replace("assets/SnowpackStatisticsByDate/SnowpackStatisticsByDate_", "").replace(".csv", "");
    } else {
      SNODASFile = 'https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_' + currDate + '.csv';
      temp = SNODASFile.replace("https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_", "")
      .replace(".csv", "");
    }
    // Create the more human-readable date format to be displayed. This is what's being used in the side-nav component to be
    // displayed under Current SNODAS Date, and needed to be slowed down so it can sync up with the async map update, and the
    // animation slider.
    setTimeout(() => {
      this.currentDateDisplay = temp.substring(0,4) + "-" + temp.substring(4,6) + "-" + temp.substring(6);
    }, 200);

    // Use Papaparse to read the CSV file
    Papa.parse(SNODASFile, {
      delimiter: ",",
      download: true,
      comments: "#",
      skipEmptyLines: true,
      complete: (result: any, file: any) => {
        // Update the upper left control displaying the current date.
        this.mapDate.update();
        // Right before the newly merged data geoJSON is created and added to the map, remove the old version. This will make
        // the transition indistinguishable to a user.
        if (this.basinBoundaryWithData) {
          this.mainMap.removeLayer(this.basinBoundaryWithData);
        }
        // Merge the basin boundary data with the statistics of each basin, then add that object to the map.
        this.basinBoundaryWithData = L.geoJson(MergeData(this.SNODAS_Geometry, result), {
          style: setSWELayerStyle,
          onEachFeature: onEachFeature
        }).addTo(this.mainMap);

        // SelectBasinCall is set to true when the ClickOnMapItem function is called.
        var selectBasinCall = false;

        /**
         * Takes in a SNODAS Geometry geoJSON array and an array populated from the SnowpackStatisticsByDate/YYYYMMDD CSV file
         * that contains data for each basin. They will be iterated using a nested for loop. This function will iterate through
         * and match each basin with its proper data.
         * @param SNODAS_Geometry 
         * @param SNODAS_Statistics 
         * @returns 
         */
        function MergeData(SNODAS_Geometry: any, SNODAS_Statistics: any) {
          // Loops through geojson data.
          for(let index in SNODAS_Geometry.features) {
            // Loops through CSV data.
            for(let index2 = 0; index2 < SNODAS_Statistics["data"].length; index2++) {
              // If the LOCAL_ID at csv[index2] matches the LOCAL_ID of the geoJSON object then merge the data.
              if(SNODAS_Geometry.features[index]["properties"]["LOCAL_ID"] === SNODAS_Statistics["data"][index2][1]) {
                // Loop through the csv data in index2
                for(let key in SNODAS_Statistics["data"][index2]) {
                  // Add a new property for geoJSON feature containing the new CSV data.
                  SNODAS_Geometry.features[index]["properties"][SNODAS_Statistics["data"][0][key]] = SNODAS_Statistics["data"][index2][key];
                }
                // When map is set up all basins are initialized with hasBeenSelected to false because none have been clicked yet
                SNODAS_Geometry.features[index]["properties"]["hasBeenSelected"] = false;
              }
            }
          }
          return SNODAS_Geometry;
        }

        /**
         * Used when adding the SNODAS data from a CSV file to the map. It makes every object in the data have certain properties.
         * Each object will have a mouseover, mouseout, and click property. 
         * @param feature The feature object and all its properties in the layer.
         * @param layer The reference to the layer object the feature comes from.
         */
        function onEachFeature(feature: any, layer: any) {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: selectBasin
          });
          layer._leaflet_id = feature.properties.LOCAL_ID;
        }

        /**
         * 
         * @param e The Event object from Leaflet.
         */
        function highlightFeature(e: any) {
          selectBasinCall = false;
          var layer = e.target;
          layer.setStyle({
            weight: 6,
            color: '#666',
            dashArray: '',
          });
  
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }

          _this.info.update(layer.feature.properties);
        }

        

        /**
         * Called by onEachFeature. It is used once a basin has been highlighted, then the user moves the mouse it will
         * reset the layer back to the original state.
         * @param e The Event object from Leaflet.
         */
        function resetHighlight(e: any) {
          if(!e.target.feature.properties.hasBeenSelected)
          {
            _this.basinBoundaryWithData.resetStyle(e.target);
            _this.info.update();
            if(selectBasinCall === true)
            {
              var layer = _this.basinBoundaryWithData.getLayer(e.target.feature.properties.LOCAL_ID);
              layer.fireEvent('mouseover');
              selectBasinCall = false;
            }
          }
        }

        /**
         * Called by onEachFeature. Used if user clicks on a basin. Once a basin is selected, the proper SWE graphs
         * will be accessible to view.
         * @param e The Event object from Leaflet.
         */
        function selectBasin(e: any) {
          clickOnMapItem(e.target.feature.properties.LOCAL_ID);
        }

        /**
         * Called when adding the geoJSON data from the SNODAS files. Style controls the fill color of each basin,
         * the weight of the lines surrounding the basin, the color of the lines outlining each basin, and the opacity.
         * @param feature 
         * @returns 
         */
        function setSWELayerStyle(feature: any) {
          return {
            fillColor: _this.getColor((feature.properties.SNODAS_SWE_Mean_in == undefined ? feature.properties.SWE_Mean_inches:feature.properties.SNODAS_SWE_Mean_in)),
            weight: 1,
            color: 'black',
            fillOpacity: 0.60
          };
        }

        /* This function is used to imitate the fire event 'mouseover'.
        It is called when a user selects a basin from the 'Select Basin' button.
        Once a basin is selected this function will imitate a user moving the
        cursor over a basin. This function takes in a LOCAL_ID and will highlight
        the currently selected basin. */
        var basinSelected = false;     /* basin_selected is a boolean value. This is set true when the ClickOnMapItem function is called.
        This boolean value is used to highlight basins and will prevent the highlight to be removed when the
        user "mouseouts" of the basin.*/
        var oldBasin: any;
        if(basin != 'none') {
          clickOnMapItem(basin.slice(basin.indexOf('(')+1, basin.indexOf(')')));
        }

        function clickOnMapItem(Local_ID: string) {
          // Once a basin has been clicked, use the eventsSubject Subject (which is also an observable and observer) and uses the
          // next method to send the selected basin's ID to the child side-nav component as an event.
          _this.eventsSubject.next(Local_ID);
          if(basinSelected === true) {
            var oldLayer = _this.basinBoundaryWithData.getLayer(oldBasin);
            oldLayer.feature.properties.hasBeenSelected = false;
            oldLayer.fireEvent('mouseout');
          }
          var id = Local_ID;
          oldBasin = Local_ID;
          //get target layer by it's id
          var layer = _this.basinBoundaryWithData.getLayer(id);
          //fire event 'click' on target layer
          layer.fireEvent('mouseover');
          layer.feature.properties.hasBeenSelected = true;
          // select_basin_call = true;
          basinSelected = true;
        }
      }

    });
  }

  /**
   * Controls the color of each basin depending on the Mean SME data value, as well as legend colors.
   * @param d 
   * @returns 
   */
  public getColor(start: number) {
    if(start === undefined)
    {
      return '#000000';
    }
    return start < 0.02 ? '#ffffff':
    start < 0.04 ? '#eff3ff':
    start < 0.2 ? '#bdd7e7':
    start < 0.4 ? '#6baed6':
    start < 1.0 ? '#3182bd':
    start < 2.0 ? '#08519c':
    start < 4.0 ? '#49006a':
    start < 6.0 ? '#7a0177':
    start < 10.0 ? '#ae017e':
    start < 20.0 ? '#dd3497':
    start < 30.0 ? '#f768a1':
    start < 40.0 ? '#fa9fb5':
    start < 80.0 ? '#fcc5c0':
    '#fde0dd';
  }

  /**
   * Initializes the Leaflet map when the Map Component is created. Is only called once, with subsequent updates using the
   * buildMap function.
   * @param currDate The current date of the initial display of the map.
   */
  private initMap(): void  {
    // Hold this class instance for use in smaller scoped functions that contain their own `this`.
    var _this = this;

    // Creates the map inside the div and centers on Colorado. Uses the leafletConfig object to set the view and zoom on the map.
    this.mainMap = L.map('mapID', {
      maxZoom: 16,
      preferCanvas: false,
      wheelPxPerZoomLevel: 150,
      zoomControl: false,
      zoomSnap: 0.1
    }).setView([this.appConfig.lat, this.appConfig.long], this.appConfig.zoom);  

    // The background layer for the map
    this.background = L.tileLayer(this.appConfig.tiles, {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy;<a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(this.mainMap);

    // Bottom right corner. Shows the current lat and long of the mouse cursor as 'º'.
    L.control.mousePosition({position: 'bottomright',lngFormatter: function(num: number) {
      var direction = (num < 0) ? 'W' : 'E';
      var formatted = Math.abs(num).toFixed(6) + 'º ' + direction;
      return formatted;
      },
      latFormatter: function(num: number) {
        var direction = (num < 0) ? 'S' : 'N';
        var formatted = Math.abs(num).toFixed(6) + 'º ' + direction;
        return formatted;
    }}).addTo(this.mainMap);

    // Bottom Right corner. This shows the scale in km and miles on the map.
    L.control.scale({position: 'bottomright',imperial: true}).addTo(this.mainMap);

    /* This creates the legend on the map. It iterates through an array of legend scale values (SWE  in inches). It then adds
    this to the legend. */
    var legend = L.control({position: 'topright'});
    
    legend.onAdd = function () {

      var div = L.DomUtil.create('div', 'info legend');

      var grades = [0,0.02,0.04,0.2,0.4,1,2,4,6,10,20,30,40,80];
      // Reference: https://www.nohrsc.noaa.gov/snow_model/images/full/National/nsm_swe/201701/nsm_swe_2017012005_National.jpg
      var labels = ['<strong>Mean SWE (in)</strong>'];
      var from: number;
      var to: number;

      for (let i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
          '<i style="background:' + _this.getColor(from + 0) + '"></i>&nbsp; ' +
          from + (to ? '&ndash;' + to : '+'));
      }

      div.innerHTML = labels.join('<br>');
      return div;
    };
    legend.addTo(this.mainMap);

    // Grabs data from CO_boundary.geojson and adds it to the map. Creates the black border around Colorado.
    this.appService.getJSONData(this.appConfig.stateBorder).subscribe((border: any) => {
      _this.COBoundary = L.geoJSON(border, {style: this.setStateBoundaryStyle}).addTo(this.mainMap);
      // Bring the border to the back of the layers, as it's only there for reference
      _this.COBoundary.bringToBack();
    });

    // Top left corner of the map. Shows the current date the map is displaying
    this.mapDate = L.control({position: 'topleft'});

    this.mapDate.onAdd = function(map: any) {
      this._div = L.DomUtil.create('div', 'mapDate');
      this.update();
      return this._div;
    };

    this.mapDate.update = function() {
      this._div.innerHTML = '<h4>' + 'Map Data Date: ' + _this.appService.getCurrDate().substring(0,4) + '-' +
      _this.appService.getCurrDate().substring(4,6) + '-' + _this.appService.getCurrDate().substring(6) + "</h4>";
    };

    this.mapDate.addTo(this.mainMap);

    // Create the legend for daily basin statistics on the map.
    this.info = L.control({ position: 'bottomleft' });

    this.info.onAdd = function(map: any) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };

    /* The code below is what shows up in the Daily Basin Statistics informational
    legend in the bottom left corner of the map. */
    this.info.update = function(props: any) {
      this._div.innerHTML = '<h4> Daily Basin Statistics </h4>' +  (props ? "<br><b>Local Basin Name: </b>" + props.LOCAL_NAME +
      "<br><b>Local Basin ID: </b>" + props.LOCAL_ID + "<br>" + "<br><b><u> SWE</b></u>" + "<br><b>Mean: </b>"
      + Math.round(props.SNODAS_SWE_Mean_mm).toLocaleString('en-US') + " mm | "
      + Number(props.SNODAS_SWE_Mean_in).toLocaleString('en-US',{minimumFractionDigits: 1}) + " in"
      + "<br><b>Effective Area: </b>"
      + Number(props.SNODAS_EffectiveArea_sqmi).toLocaleString('en-US', {minimumFractionDigits: 1}) + " sqmi"
      + "<br><b>Volume: </b>"
      + Math.round(props.SNODAS_SWE_Volume_acft).toLocaleString('en-US') + " acft"
      + "<br><b>Volume 1 Week Change: </b>"
      + Math.round(props.SNODAS_SWE_Volume_1WeekChange_acft).toLocaleString('en-US') + " acft"
      + "<br>" + "<br><b>Snow Cover: </b>"
      + Math.round(props.SNODAS_SnowCover_percent).toLocaleString('en-US') + "%"
      :'Hover over a basin');
    };

    /* This will add the information legend to the leaflet map */
    this.info.addTo(this.mainMap);

    /* Top Left Corner of Map. Allows for a home button to reset
      to the default zoom. */
      this.zoomHome = L.Control.zoomHome({
        position: 'topleft',
        zoomHomeTitle: 'Zoom to initial extent'
      });
      this.zoomHome.addTo(this.mainMap);

  }

  /**
   * Called after the constructor, initializing input properties, and the first call to ngOnChanges.
   */
  ngOnInit(): void {

    // Wait the refreshInterval, then keep waiting by the refreshInterval from then on.
    // const delay = timer(30000, 30000);

    // delay.subscribe(() => {
    //   window.location.reload();
    // });
    
    // Set the pre-initialized appConfig JSON object to appConfig.
    this.appConfig = this.appService.getAppConfig();

    if (this.appConfig.refreshTime) {
      this.setMapRefreshTime();
    }

    this.forkJoinSub$ = this.appService.setMapData().subscribe((results: any) => {
      // Results are as follows:
      // results[0] - setDates: The plain text file list of dates from assets/ or the state server URL.
      // results[1] - basinBoundaries: The geoJSON file for the SNODAS boundaries (basins) in Colorado.

      this.appService.setDates(results[0]);
      this.SNODAS_Geometry = results[1];

      // Set the initial current date from the ListOfDates.txt file.
      this.appService.setCurrDate(this.appService.getDates()[0]);
      // Initialize the map for the first time.
      if (this.appService.isInitMap() === true) {
        // Set initMap to false.
        this.appService.mapCreated();
        this.appService.setLeafletConfig();

        // Initialize the Leaflet map with the current date.
        this.initMap();
        // Build the map each update.
        this.buildMap(this.appService.getCurrDate(), 'none', false);
      }
      // Map has already been initialized.
      else {
        // Initialize the Leaflet map with the current date.
        this.initMap();
        // Build the map each update.
        this.buildMap(this.appService.getCurrDate(), 'none', false);
      }
    });
    
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {
    this.forkJoinSub$.unsubscribe();
    this.refreshSub$.unsubscribe();
  }

  /**
   * Sets one or more times throughout the day to refresh the SNODAS page, as if
   * the user clicked the refresh button.
   */
  private setMapRefreshTime(): void {
    // Iterate over each time array given to the refreshTime app-config property.
    for (let timeArr of this.appConfig.refreshTime) {
      //         timeArr structure
      // timeArr[0], timeArr[1], timeArr[2]
      //       refreshTime structure
      // [    8    ,      0    ,     0     ]          Refresh map at 8:00am
      // [   13    ,     30    ,     0     ]          Refresh map at 1:30pm
      const delay = this.appService.refreshAt(timeArr[0], timeArr[1], timeArr[2]);
      // Add each subscription to the refreshSub$ so all can be unsubscribed on
      // component destruction.
      this.refreshSub$.add(delay.subscribe(() => {
        window.location.reload();
      }));
    }
  }

  /* This function is used for the CO_boundary style. It sets the weight of the line used
  to border Colorado, the color of that line, and sets the fill opacity to 0. */
  public setStateBoundaryStyle(feature: any): any {
    return {
      weight: 5,
      color: 'black',
      fillOpacity: 0,
    };
  }

  /* The ShowValue function is called in order to display the current date
  the animation is on. This function will grab the span element with id='range'
  and update it's innerHTML value to equal the current date in the format
  YYYY-MM-DD. */
  // public showValue(newValue) {
  //   document.getElementById("range").innerHTML = newValue.substring(0,4) + "-" + newValue.substring(4,6) + "-" + newValue.substring(6);
  //   this.buildMap(newValue, 'none', true);
  // }

  /**
   * Changes which basin is currently highlighted on the map.
   * @param basin 
   */
  public updateBasin(basin: string): void {
    this.buildMap(this.appService.getCurrDate(), basin, true);
  }

  /**
   * Deconstruct the hyphenated date format (xxxx-xx-xx) into a `ListOfDates.txt`
   * format (xxxxxxxx). Called when selecting a new date from the date
   * dropdown.
   * @param date The hyphenated date string from the Date dropdown list.
   */
  public updateMapDate(date: string): void {
    date = date.substring(0,4) + date.substring(5,7) + date.substring(8);
    this.buildMap(date, 'none', true);
  }

}
