import { Component,
          OnInit }      from '@angular/core';
import { Subscription } from 'rxjs';

import { AppService }   from '../../app.service';

import * as Papa        from 'papaparse';


// import * as L         from 'leaflet';
declare var L: any;


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  /**
   * The background layer of the map.
   */
  public background: any;
  /**
   * 
   */
  public currentDateDisplay: string;
  /**
   * Class variable for the Leaflet map's config file subscription object so it can be closed on this component's destruction.
   */
  private forkJoinSubscription$ = <any>Subscription;
  /**
   * The main Leaflet map.
   */
  public mainMap: any;
  /**
   * The map configuration object obtained from map-config.json.
   */
  public mapConfig: any;
  /**
   * GeoJSON layers on the map.
   */
  public geojson: any;
  /**
   * Info panel on  bottom left of the map.
   */
  public info: any;
  /**
   * Date display on top left of the map.
   */
  public mapDate: any;
  /**
   * 
   */
  public SNODAS_Geometry: any;
  /**
   * Upper left zoom home map control.
   */
  public zoomHome: any;



  constructor(private appService: AppService) { }


  /**
   * 
   * @param currDate The current date displayed on the map.
   * @param basin 
   * @param defined 
   */
  private buildMap(currDate: any, basin: any, defined: boolean): void {

    var _this = this;
    // 
    this.appService.setCurrDate(currDate);
    // Add the render to the map every time it is built
    L.svg().addTo(this.mainMap);

    // Remove all controls. May not be needed?
    if (defined === true) {
      this.info.remove();
      this.mapDate.remove();
      this.zoomHome.remove();
    }

    // Loops through all the layers and removes them if they are defined and not the background layer
    this.mainMap.eachLayer(function (layer: any) { 
      if(layer != _this.background && layer != null && typeof(layer) != "undefined" && _this.mainMap != "undefined"){
          _this.mainMap.removeLayer(layer);
      }
    });

    // Grabs data from CO_boundary.geojson and adds it to the map. Creates the black border around Colorado.
    this.appService.getJSONData(this.mapConfig.state_border).subscribe((border: any) => {
      var border = L.geoJSON(border, {style: this.setStateBoundaryStyle}).addTo(this.mainMap);
      // Bring the border to the back of the layers, as it's only there for reference
      border.bringToBack();
    });

    // This grabs the SNODAS data from the SnowpackbyDate_(CURRENT DATE).csv file. It then assigns that data to the
    // SNODAS_Statistics variable.
    var SNODASFile = "assets/SnowpackStatisticsByDate/SnowpackStatisticsByDate_" + currDate + ".csv";
    // Build the string to be displayed
    var temp = SNODASFile.replace("assets/SnowpackStatisticsByDate/SnowpackStatisticsByDate_", "").replace(".csv", "");
    this.currentDateDisplay = temp.substr(0,4) + "-" + temp.substr(4,2) + "-" + temp.substr(6,2);
    // Use Papaparse to read the CSV file
    Papa.parse(SNODASFile, {
      delimiter: ",",
      download: true,
      comments: "#",
      skipEmptyLines: true,
      complete: (result: any, file: any) => {
        /* This call below merges the Geometry data with the statistics of each basin.
        It then adds that merged object to the map as a layer allowing users to see
        the SNODAS data visually on the map. */
        _this.geojson = L.geoJson(MergeData(_this.SNODAS_Geometry,result),
        {style: setSWELayerStyle, onEachFeature: onEachFeature}).addTo(_this.mainMap);

        /* This feature is called by the onEachFeature function. It is what allows users to
        highlight over basins and will pop up a gray line outlining the basin. */
        var selectBasinCall = false;  /* select_basin_call is a boolean value. This is set true when the ClickOnMapItem function is called.

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

        // Top left corner of the map. Shows the current date the map is displaying
        this.mapDate = L.control({position: 'topleft'});

        this.mapDate.onAdd = function(map: any){
          this._div = L.DomUtil.create('div', 'mapDate');
          this.update();
          return this._div;
        };

        this.mapDate.update = function() {
          this._div.innerHTML = '<h4>' + 'Current Date: ' + currDate.substr(0,4) + '-' + currDate.substr(4,2) + '-' +
          currDate.substr(6,2) + "</h4>";
        };

        this.mapDate.addTo(this.mainMap);

        /* Top Left Corner of Map. Allows for a home button to reset
        to the default zoom. */
        this.zoomHome = L.Control.zoomHome({
          position: 'topleft',
          zoomHomeTitle: 'Zoom to initial extent'
        });
        this.zoomHome.addTo(this.mainMap);

        /* The below code is used to create the informational legend on the map.
        info.update is used to call the statistics for each basin. */
        this.info = L.control({position: 'bottomleft'});

        this.info.onAdd = function(map: any){
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

        /**
         * Called by onEachFeature. It is used once a basin has been highlighted, then the user moves the mouse it will
         * reset the layer back to the original state.
         * @param e The Event object from Leaflet.
         */
        function resetHighlight(e: any) {
          if(!e.target.feature.properties.hasBeenSelected)
          {
            _this.geojson.resetStyle(e.target);
            _this.info.update();
            if(selectBasinCall === true)
            {
              var layer = _this.geojson.getLayer(e.target.feature.properties.LOCAL_ID);
              layer.fireEvent('mouseover');
              selectBasinCall = false;
            }
          }
        }

        /* Called by onEachFeature. Used if user clicks on a basin. Once a basin is selected, the proper SWE graphs
        will be accessible to view. */
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
        function setSWELayerStyle(feature: any){
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
        if(basin != 'none'){
          clickOnMapItem(basin.slice(basin.indexOf('(')+1, basin.indexOf(')')));
        }

        function clickOnMapItem(Local_ID) {
          if(basinSelected === true){
            var oldLayer = _this.geojson.getLayer(oldBasin);
            oldLayer.feature.properties.hasBeenSelected = false;
            oldLayer.fireEvent('mouseout');
          }
          var id = Local_ID;
          oldBasin = Local_ID;
          //get target layer by it's id
          var layer = _this.geojson.getLayer(id);
          //fire event 'click' on target layer
          layer.fireEvent('mouseover');
          layer.feature.properties.hasBeenSelected = true;
          SetSNODASPlot(Local_ID);
          // select_basin_call = true;
          basinSelected = true;
        }

        /* SetSNODASPlot is called whenever a basin is clicked. Once clicked,
        this function will recieve the LOCAL_ID of that basin and then update
        the SNODAS Plots image section with the proper plot graph. This will
        then get updated everytime a new basin is selected */
        function SetSNODASPlot(name) {
          (<HTMLInputElement>document.getElementById("button_one")).disabled = false;
          (<HTMLInputElement>document.getElementById("button_two")).disabled = false;
          (<HTMLInputElement>document.getElementById("button_three")).disabled = false;
          (<HTMLInputElement>document.getElementById("button_four")).disabled = false;
          (<HTMLInputElement>document.getElementById("button_five")).disabled = false;
          (<HTMLInputElement>document.getElementById("button_six")).disabled = false;
          (<HTMLInputElement>document.getElementById("button_seven")).disabled = false;

          _this.appService.setChartBasinID(name);

          (<HTMLImageElement>document.getElementById("Basin_SnowCover_img")).src = "assets/SnowpackGraphsByBasin/" + name + "-SNODAS-SnowCover.png";
          document.getElementById("close-button-snowcover").innerHTML = "Click anywhere to close graph view";

          (<HTMLImageElement>document.getElementById("Basin_SWE_img")).src = "assets/SnowpackGraphsByBasin/" + name + "-SNODAS-SWE.png";
          document.getElementById("close-button-swe").innerHTML = "Click anywhere to close graph view";

          // (<HTMLImageElement>document.getElementById("Basin_SWE_Volume_img")).src = "assets/SnowpackGraphsByBasin/" + name + "-SNODAS-SWE-Volume.png";
          // document.getElementById("close-button-swe-volume").innerHTML = "Click anywhere to close graph view";

          // (<HTMLImageElement>document.getElementById("Basin_SWE_Upstream_Total_img")).src = "assets/SnowpackGraphsByBasin/" + name + "-UpstreamTotal-SNODAS-SWE-Volume.png";
          // document.getElementById("close-button-swe-upstream-total").innerHTML = "Click anywhere to close graph view";

          (<HTMLImageElement>document.getElementById("Basin_SWE_Upstream_Cumulative_img")).src = "assets/SnowpackGraphsByBasin/" + name + "-UpstreamTotal-SNODAS-SWE-Volume-Gain-Cumulative.png";
          document.getElementById("close-button-swe-upstream-cumulative").innerHTML = "Click anywhere to close graph view";

          (<HTMLImageElement>document.getElementById("Basin_Swe_Volume_1WeekChange_img")).src = "assets/SnowpackGraphsByBasin/" + name + "-SNODAS-SWE-Volume-1WeekChange.png";
          document.getElementById("close-button-swe-volume-change").innerHTML = "Click anywhere to close graph view";

          (<HTMLImageElement>document.getElementById("Basin_Swe_Volume_Gain_img")).src = "assets/SnowpackGraphsByBasin/" + name + "-SNODAS-SWE-Volume-Gain-Cumulative.png";
          document.getElementById("close-button-swe-volume-gain").innerHTML = "Click anywhere to close graph view";

          document.getElementById("BasinID").innerHTML = "Selected Basin ID: " + name;
          document.getElementById("BasinName").innerHTML = "Basin Name: " + getBasinName(name);
        }

        /* getBasinName takes in a basin id and will search through the
        SNODAS_Geometry.json file to find the local name of the basin. It will
        then return the local name of the coinciding local id. */
        function getBasinName(id: any) {
          for(let index in this.SNODAS_Geometry.features) {
            if(this.SNODAS_Geometry.features[index]["properties"]["LOCAL_ID"] == id) {
                return this.SNODAS_Geometry.features[index]["properties"]["LOCAL_NAME"];
            }
          }
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
   * 
   */
  private initMap(): void  {
    // Creating a variable to hold this instance for use in smaller scoped functions.
    var _this = this;

    // Creates the map inside the div and centers on colorado
    this.mainMap = L.map('mapID', {zoomControl: false, preferCanvas: false}).setView([this.mapConfig.lat, this.mapConfig.long], this.mapConfig.zoom);

    // The background layer for the map
    this.background = L.tileLayer(this.mapConfig.tiles, {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy;<a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(this.mainMap);

    // Bottom right corner. Shows the current lat and long of the mouse cursor as 'º'.
    L.control.mousePosition({position: 'bottomright',lngFormatter: function(num: number) {
      var direction = (num < 0) ? 'W' : 'E';
      var formatted = Math.abs(L.Util.formatNum(num, 3)) + 'º ' + direction;
      return formatted;
      },
      latFormatter: function(num: number) {
        var direction = (num < 0) ? 'S' : 'N';
        var formatted = Math.abs(L.Util.formatNum(num, 3)) + 'º ' + direction;
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

  }

  /**
   * Called after the constructor, initializing input properties, and the first call to ngOnChanges.
   */
  ngOnInit(): void {
    // Set the pre-initialized mapConfig JSON object to mapConfig.
    this.mapConfig = this.appService.getMapConfig();
    console.log(this.mapConfig);

    this.forkJoinSubscription$ = this.appService.setMapData().subscribe((results: any) => {
      // Results are as follows:
      // results[0] - setDates

      this.appService.setDates(results[0]);
      this.SNODAS_Geometry = results[1];

      // Initialize the Leaflet map.
      this.initMap();
      // Build the map each update.
      this.buildMap(this.appService.getDates()[0], 'none', false);
    });
    
    
  }

  /* This function is used for the CO_boundary style. It sets the weight of the line used
  to border Colorado, the color of that line, and sets the fill opacity to 0. */
  public setStateBoundaryStyle(feature){
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
  //   document.getElementById("range").innerHTML = newValue.substr(0,4) + "-" + newValue.substr(4,2) + "-" + newValue.substr(6,2);
  //   this.buildMap(newValue, 'none', true);
  // }

  /* Changes which basin is currently highlighted on the map */
  // public updateBasin(basin) {
  //   this.buildMap(this.globals.date, basin, true);
  // }

  /* Called to update the date of the data the map is displaying */
  // public updateFile(file) {
  //   file = file.substr(0,4) + file.substr(5,2) + file.substr(8,2);
  //   this.buildMap(file, 'none', true);
  // }

}
