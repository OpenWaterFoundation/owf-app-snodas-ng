import { Component,
          Inject }    from '@angular/core';
import { DOCUMENT }   from '@angular/common';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'snodas';


  /**
   * 
   * @param appService The reference to the application service for retrieving data over the network and holding global data.
   * @param document A DI Token representing the main rendering context. In a browser this is the DOM Document.
   */
  constructor(private appService: AppService,
              @Inject(DOCUMENT) private document: HTMLDocument) {

    this.setFavicon();
  }


  /**
   * Dynamically uses the path to a user given favicon, or uses the default if no property in the app-config is detected.
   * @param appConfig The app-config.json object.
   */
  private setFavicon(): void {

    // Check to see if a user defined path to a favicon has been set
    // if (appConfig.favicon)
    //   this.appService.setFaviconPath(appConfig.favicon);
    // else {
      // Favicon app configuration property not given. Use a default.
    this.document.getElementById('appFavicon')
                  .setAttribute('href', this.appService.getDefaultFaviconPath());
    //   return;
    // }
    
    // Set the user defined favicon if the favicon has not been set yet (no default).
    // if (!this.appService.faviconSet()) {
    //   this.document.getElementById('appFavicon')
    //                 .setAttribute('href', this.appService.getAppPath() + this.appService.getFaviconPath());
    //   this.appService.setFaviconTrue();
    // }

  }
}
