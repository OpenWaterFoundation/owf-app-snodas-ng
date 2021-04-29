import { Component,
          Inject }    from '@angular/core';
import { DOCUMENT }   from '@angular/common';
import { Title }      from '@angular/platform-browser';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  /**
   * 
   * @param appService The reference to the application service for retrieving data over the network and holding global data.
   * @param document A DI Token representing the main rendering context. In a browser this is the DOM Document.
   */
  constructor(private appService: AppService,
              private titleService: Title,
              @Inject(DOCUMENT) private document: HTMLDocument) { }


  public ngOnInit(): void {
    this.setFavicon();
    this.setTitle();
  }

  /**
   * Dynamically uses the path to a user given favicon, or uses the default if no property in the app-config is detected.
   */
  private setFavicon(): void {
    // Check to see if a user defined path to a favicon has been set
    if (this.appService.getFaviconPath()) {
      this.document.getElementById('appFavicon')
                  .setAttribute('href', this.appService.getAppPath() + this.appService.getFaviconPath());
    }
    else {
      // Favicon app configuration property not given. Use a default.
    this.document.getElementById('appFavicon')
                  .setAttribute('href', this.appService.getDefaultFaviconPath());
    //   return;
    }
  }

  /**
   * Sets the title of the current HTML document using the `title` property from the `app-config.json` file.
   */
  private setTitle(): void {
    this.titleService.setTitle(this.appService.getAppTitle());
  }
}
