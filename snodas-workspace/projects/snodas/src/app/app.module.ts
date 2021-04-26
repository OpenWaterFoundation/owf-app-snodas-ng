import { BrowserModule }           from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER,
          NgModule }               from '@angular/core';
import { HashLocationStrategy,
          LocationStrategy }       from '@angular/common';
import { HttpClientModule }        from '@angular/common/http';
import { FormsModule,
          ReactiveFormsModule }    from '@angular/forms';

import { ScrollingModule }         from '@angular/cdk/scrolling';    

import { MatButtonModule }         from '@angular/material/button';
import { MatDatepickerModule }     from '@angular/material/datepicker';
import { MatExpansionModule }      from '@angular/material/expansion';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatInputModule }          from '@angular/material/input';
import { DateAdapter,
  ErrorStateMatcher,
          MatNativeDateModule, 
          MAT_DATE_FORMATS}        from '@angular/material/core';
import { MatSelectModule }         from '@angular/material/select';
import { MatSidenavModule }        from '@angular/material/sidenav';
import { MatSliderModule }         from '@angular/material/slider';
import { MatToolbarModule }        from '@angular/material/toolbar';
import { MatTooltipModule }        from '@angular/material/tooltip';

import { ShowdownModule }          from 'ngx-showdown';
import * as Showdown               from 'showdown';

import { AppRoutingModule }        from './app-routing.module';
import { AppService }              from './app.service';

import { AboutComponent }          from './main-content/about/about.component';
import { AppComponent }            from './app.component';
import { DocComponent }            from './main-content/doc/doc.component';
import { HeaderComponent }         from './header/header.component';
import { NotFoundComponent }       from './main-content/not-found/not-found.component';
import { MapComponent }            from './main-content/map/map.component';
import { SideNavComponent }        from './main-content/map/side-nav/side-nav.component';
import { MenuDisablePipe }         from './main-content/map/side-nav/menu-disable.pipe';
import { DataComponent }           from './main-content/data/data.component';
import { AppDateAdapter,
          APP_DATE_FORMATS }       from './main-content/map/side-nav/format-datepicker';


/**
 * Retrieves the map configuration file JSON before the application loads, so pertinent information can be ready to use before
 * the app has finished initializing.
 * @param appConfig An instance of the top-level AppService to GET the data from the `app-config` file.
 * @returns A promise.
 */
const appInit = (appService: AppService) => {
  return (): Promise<any> => {
    return appService.loadConfigFiles();
  };
};

const classMap = {
  h1: 'showdown_h1',
  h2: 'showdown_h2',
  ul: 'ui list',
  li: 'ui item',
  table: 'showdown_table',
  td: 'showdown_td',
  th: 'showdown_th',
  tr: 'showdown_tr',
  p: 'showdown_p',
  pre: 'showdown_pre'
}

const bindings = Object.keys(classMap)
  .map(key => ({
    type: 'output',
    regex: new RegExp(`(<${key}>|<${key} (.*?)>)`, 'g'),
    replace: `<${key} class="${classMap[key]}">`
  }));

const convert = new Showdown.Converter({
  extensions: [bindings]
});

@NgModule({
  declarations: [
    AboutComponent,
    AppComponent,
    DataComponent,
    DocComponent,
    HeaderComponent,
    NotFoundComponent,
    MapComponent,
    MenuDisablePipe,
    SideNavComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    ScrollingModule,
    ShowdownModule.forRoot({
      emoji: true,
      extensions: [bindings],
      flavor: 'github',
      noHeaderId: true,
      simpleLineBreaks: false,
      strikethrough: true,
      tables: true
    })
  ],
  providers: [
    AppService,
    MatDatepickerModule,
    { provide : LocationStrategy , useClass: HashLocationStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: appInit,
      multi: true,
      deps: [AppService]
    },
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
