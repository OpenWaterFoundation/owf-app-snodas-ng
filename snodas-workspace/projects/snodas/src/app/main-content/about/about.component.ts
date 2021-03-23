import { Component,
          OnInit } from '@angular/core';

import { AppService } from '../../app.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  /**
   * The class variable to be bound to the [value] property for the Showdown Angular html tag.
   */
  public markdownHTML: any;


  /**
   * 
   * @param appService The reference to the application service for retrieving data over the network and holding global data.
   */
  constructor(private appService: AppService) { }


  /**
   * Called right after the constructor. Sets the markdownHTML string to what was received during app initialization.
   */
  ngOnInit(): void {
    this.markdownHTML = this.appService.getAboutText();
  }

}
