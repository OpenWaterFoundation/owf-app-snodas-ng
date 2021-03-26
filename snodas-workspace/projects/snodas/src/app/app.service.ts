import { Injectable }    from '@angular/core';
import { HttpClient, 
          HttpHeaders }  from '@angular/common/http';

import { catchError }    from 'rxjs/operators';
import { forkJoin,
          Observable,
          of }           from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AppService {
  /**
   * The text containing the markdown from the `about.md` file in assets.
   */
  public aboutText: any;
  /**
   * The current date displayed on the map.
   */
  public currDate: string;
  /**
   * The list of basins.
   */
  // basins: string[] = this.getBasins();
  /**
   * The chart basin ID.
   */
  public chartBasinID: any;
  /**
   * The text containing the markdown from the `data.md` file in assets.
   */
  public dataText: any;
  /**
   * The list of dates.
   */
  public dates: any;
  /**
   * The hard-coded string of the path to the default icon path that will be used for the website if none is given.
   */
  public readonly defaultFaviconPath = 'assets/img/coloradoDNR.ico';
  /**
   * Variable to notify the app whether in a development (local) or production (State server) environment.
   */
  public devEnv: boolean;
  /**
   * The text containing the markdown from the `documentation.md` file in assets.
   */
  public docText: any;
  /**
   * The boolean representing if a favicon path has been provided by the user.
   */
  public FAVICON_SET = false;
  /**
   * The path to the user-provided favicon .ico file.
   */
  public faviconPath: string;
  /**
   * Boolean representing whether the initial Leaflet map is being created, or if it has already been created.
   */
  public initMap = true;
  /**
   * The configuration object for tracking a Leaflet map's state between tabs.
   */
   public leafletConfig: {
    lat?: string,
    long?: string,
    zoom?: number
  };
  /**
   * The map configuration object, from `map-config.json`.
   */
  public mapConfig: Object;
   /**
    * Array to hold Leaflet map objects, for remembering state when switching between nav bar tabs.
    */
  public mapList: any[];
  


  /**
   * 
   * @param http The HttpClient instance
   */
  constructor(private http: HttpClient) { }


  /**
   * Testing.
   * @param map 
   */
  public addMap(map: any): void {
    this.mapList.push(map);
  }

  /**
   * 
   */
  public checkIfMapChanged(): boolean {
    if (this.leafletConfig.lat !== this.mapConfig['lat']) {
      return true;
    }
    return false;
  }

  /* function that returns the list of basins in the map */ 
  public formatBasins(SNODAS_Geometry: any): any[] {
    SNODAS_Geometry.features.sort(function(a: any, b: any) {
      if (a["properties"]["LOCAL_NAME"].toLowerCase() < b["properties"]["LOCAL_NAME"].toLowerCase()) {
        return -1;
      }
      if (a["properties"]["LOCAL_NAME"].toLowerCase() > b["properties"]["LOCAL_NAME"].toLowerCase()) {
        return 1;
      }
      if (a["properties"]["LOCAL_NAME"].toLowerCase() == b["properties"]["LOCAL_NAME"].toLowerCase()) {
        if (a["properties"]["LOCAL_ID"].toLowerCase() < b["properties"]["LOCAL_ID"].toLowerCase()) {
          return -1;
        }
        if (a["properties"]["LOCAL_ID"].toLowerCase() > b["properties"]["LOCAL_ID"].toLowerCase()) {
          return 1;
        }
        return
      }
      return 0;
    });
    var list = [];
    var basinsToDownload: string[] = [];
    var alreadyDownloaded: string[] = [];
    for(var index in SNODAS_Geometry.features) {
      list[index] = (SNODAS_Geometry.features[index]["properties"]["LOCAL_NAME"] +
      " (" + SNODAS_Geometry.features[index]["properties"]["LOCAL_ID"] + ")");

      if (isNaN(parseInt(SNODAS_Geometry.features[index]["properties"]["LOCAL_ID"]))) {
        basinsToDownload.push(SNODAS_Geometry.features[index]["properties"]["LOCAL_ID"]);
      } else {
        alreadyDownloaded.push(SNODAS_Geometry.features[index]["properties"]["LOCAL_ID"]);
      }
    }
    return list;
  }

  /**
   * 
   */
  public getChartBasinID(): any {
    return this.chartBasinID;
  }

  /**
   * 
   * @returns The current date the map is displaying
   */
  public getCurrDate(): string {
    return this.currDate;
  }

  /**
   * Standard getter for @var dates.
   * @returns The list of dates for the map.
   */
  public getDates(): any[] {
    return this.dates;
  }

  /**
   * 
   * @returns 
   */
  public getDatesDashes(){
    let dateArray = this.dates.slice(); // deep copy of the array
    for(let date in dateArray){ // loop through and add dashed to the dates
      dateArray[date] = dateArray[date].substr(0,4) + '-' + dateArray[date].substr(4,2) + '-' + dateArray[date].substr(6,2);
    }
    return dateArray;
  }

  /**
   * Retrieves the read only default path to the OWF Logo Favicon.
   * @returns The string representing the default Favicon path.
   */
  public getDefaultFaviconPath(): string {
    return this.defaultFaviconPath;
  }

  /**
   * @returns Boolean whether the app is in a development (local) or production (global; state server) environment.
   */
  public getDevEnv(): boolean {
    return this.devEnv;
  }

  /**
   * @returns The Leaflet configuration object.
   */
  public getLeafletConfig(): any {
    return this.leafletConfig;
  }

  /**
   * 
   * @returns 
   */
  public getMap(): any {
    return this.mapList.pop();
  }

  /**
   * @returns The text from the `about.md` markdown file.
   */
  public getAboutText(): any {
    return this.aboutText;
  }

  /**
   * @returns The text from the `data.md` markdown file.
   */
  public getDataText(): any {
    return this.dataText;
  }

  /**
   * @returns The text from the `documentation.md` markdown file.
   */
  public getDocText(): any {
    return this.docText;
  }

  /**
   * @returns The mapConfig object.
   */
  public getMapConfig() {
    return this.mapConfig;
  }

  /**
   * Read data asynchronously from a file or URL and return it as a JSON object.
   * @param path The path or URL to the file needed to be read
   * @returns The JSON retrieved from the host as an Observable
   */
   public getJSONData(path: string): Observable<any> {
    // This creates an options object with the optional headers property to add headers to the request. This could solve some
    // CORS issues, but is not completely tested yet
    // var options = {
    //   headers: new HttpHeaders({
    //     'Access-Control-Request-Method': 'GET'
    //   })
    // }
    return this.http.get<any>(path)
    .pipe(
      catchError(this.handleError<any>(path))
    );
  }

  /**
   * Read data asynchronously from a file or URL and return it as plain text.
   * @param path The path to the file to be read, or the URL to send the GET request
   * @param type Optional type of request sent, e.g. IM.Path.cPP. Used for error handling and messaging
   * @param id Optional app-config id to help determine where exactly an error occurred
   */
   public getPlainText(path: string): Observable<any> {
    // This next line is important, as it tells our response that it needs to return plain text, not a default JSON object.
      
    const options: Object = {
      headers: new HttpHeaders({
        // 'Access-Control-Request-Method': 'GET'
        // 'Content-Type': 'text/plain',
        // 'Accept': '*/*'
      }),
      responseType: 'text' as 'text'
    };
    

    return this.http.get<any>(path, options)
    .pipe(
      catchError(this.handleError<any>(path))
    );
  }

  /**
   * Handles any errors when trying to GET anything over the network.
   * @param path The path used that failed.
   * @param result Optional value to return as the observable result.
   * @returns Something so the app can keep going, instead of shutting down.
   */
  private handleError<T> (path: string, result?: T) {
    return (error: any): Observable<T> => {
      // Do stuff here

      return of(result as T)
    }
  }

  /**
   * 
   * @returns Whether the Leaflet map is being created for the first time.
   */
  public isInitMap(): boolean {
    return this.initMap;
  }

  /**
   * Uses the HttpClient to perform a GET request and retrieves the contents of the `map-config.json` file, and any other
   * files that are only once, e.g. About & Documentation markdown files. This is
   * done before app initialization.
   * @returns A promise.
   */
   public async loadConfigFiles() {
    // Map Configuration
    const mapTabData = await this.http.get('assets/map-config.json')
      .toPromise();
    this.mapConfig = mapTabData;

    // About Tab Text
    const obj: Object = { responseType: 'text' as 'text' };
    const aboutTabData = await this.http.get('assets/docs/about.md', obj)
      .toPromise();
    this.aboutText = aboutTabData;

    // Data Tab Text
    const dataTabData = await this.http.get('assets/docs/data.md', obj)
      .toPromise();
    this.dataText = dataTabData;

    // Documentation Tab Text
    const docTabData = await this.http.get('assets/docs/documentation.md', obj)
      .toPromise();
    this.docText = docTabData;
  }

  /**
   * 
   */
  public mapCreated(): void {
    this.initMap = false;
  }

  /**
   * 
   * @param ID 
   */
  public setChartBasinID(ID: any): void {
    this.chartBasinID = ID;
  }

  /**
   * Sets the selected date as the current date on the map.
   * @param currDate The current selected date.
   */
  public setCurrDate(currDate: string): void {
    this.currDate = currDate;
  }

  /**
   * Splits and sorts each date from the `ListOfDates.txt` file. 
   * @param data The data retrieved from `setMapData()`. 
   * @returns The list of dates for the map.
   */
  public setDates(data: any) {
    var text: string[] = [];
    text = data.split('\n');
    /* Sort the dates in descending order (Most recent day first) */
    text.sort(function(a: any, b: any) {
        return b - a;
    });
    /* trim each element. The split function keeps the newline
    delimiter, need to remove it. */
    for(var date in text) {
        text[date] = text[date].trim();
    }
    this.dates = text;
  }

  /**
   * Sets the @var devEnv depending on what is in the `map-config.json` file.
   * @param env Variable to notify the app whether in a development (local) or production (global, state server) environment.
   */
  public setDevEnv(env: boolean): void {
    this.devEnv = env;
  }

  /**
   * Sets the initial value for the Leaflet config object.
   */
  public setLeafletConfig(): void {
    this.leafletConfig = JSON.parse(JSON.stringify(this.getMapConfig()));
  }

  /**
   * Sets the given key in the leafletConfig object to value, if the key exists.
   */
  public setLeafletConfigProp(key: string, value: any): void {
    if (key in this.leafletConfig) {
      this.leafletConfig[key] = value;
    }
  }

  /**
   * Function to be called that sets up every asynchronous call for data retrieval.
   */
  public setMapData(): any {
    // Array to hold each Observable that needs to be subscribed to.
    var asyncData: Observable<any>[] = [];

    if (this.getDevEnv() === true) {
      asyncData.push(this.getPlainText('assets/SnowpackStatisticsByDate/ListOfDates.txt'));
    } else {
      asyncData.push(this.getPlainText('http://snodas.cdss.state.co.us/app/SnowpackStatisticsByDate/ListOfDates.txt'))
    }

    asyncData.push(this.getJSONData(this.mapConfig['SNODAS_boundaries']));
    
    return forkJoin(asyncData);
  }

}
