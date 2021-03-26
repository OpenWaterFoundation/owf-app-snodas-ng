import { Component,
          OnInit } from '@angular/core';

import { AppService } from '../../app.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {
  /**
   * The class variable to be bound to the [value] property for the Showdown Angular html tag.
   */
  public markdownHTML: any;

  constructor(private appService: AppService) { }

  ngOnInit(): void {
    this.markdownHTML = this.appService.getDataText();
  }

}
