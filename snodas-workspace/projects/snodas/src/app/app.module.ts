import { BrowserModule }           from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER,
          NgModule }               from '@angular/core';
import { HashLocationStrategy,
          LocationStrategy }       from '@angular/common';
import { HttpClientModule }        from '@angular/common/http';
import { FormsModule }             from '@angular/forms';

import { MatButtonModule }         from '@angular/material/button';
import { MatDatepickerModule }     from '@angular/material/datepicker';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatInputModule }          from '@angular/material/input';
import { MatNativeDateModule }     from '@angular/material/core';
import { MatSelectModule }         from '@angular/material/select';
import { MatSidenavModule }        from '@angular/material/sidenav';
import { MatToolbarModule }        from '@angular/material/toolbar';
import { MatTooltipModule }        from '@angular/material/tooltip';

import { AppRoutingModule }        from './app-routing.module';

import { AppService }              from './app.service';

import { AboutComponent }          from './main-content/about/about.component';
import { AppComponent }            from './app.component';
import { DocComponent }            from './main-content/doc/doc.component';
import { HeaderComponent }         from './header/header.component';
import { NotFoundComponent }       from './main-content/not-found/not-found.component';
import { MapComponent }            from './main-content/map/map.component';
import { SideNavComponent }        from './main-content/map/side-nav/side-nav.component';
import { MenuDisablePipe } from './main-content/map/side-nav/menu-disable.pipe';


/**
 * Retrieves the map configuration file JSON before the application loads, so pertinent information can be ready to use before
 * the app has finished initializing.
 * @param appConfig An instance of the top-level AppService to GET the data from the `app-config` file.
 * @returns A promise.
 */
const appInit = (appService: AppService) => {
  return (): Promise<any> => {
    return appService.loadMapConfig();
  };
};

@NgModule({
  declarations: [
    AboutComponent,
    AppComponent,
    DocComponent,
    HeaderComponent,
    NotFoundComponent,
    MapComponent,
    SideNavComponent,
    MenuDisablePipe,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  providers: [
    AppService,
    {provide : LocationStrategy , useClass: HashLocationStrategy},
    {
      provide: APP_INITIALIZER,
      useFactory: appInit,
      multi: true,
      deps: [AppService]
    },
    MatDatepickerModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
