import { Component,
          OnInit } from '@angular/core';

import { AppService } from '../../app.service';

@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.css']
})
export class DocComponent implements OnInit {
  /**
   * The class variable to be bound to the [value] property for the Showdown Angular html tag.
   */
  public markdownHTML: any;


  /**
   * 
   * @param appService 
   */
  constructor(private appService: AppService) { }


  /**
   * 
   */
  ngOnInit(): void {
    this.markdownHTML = this.appService.getDocText();
  }

}
