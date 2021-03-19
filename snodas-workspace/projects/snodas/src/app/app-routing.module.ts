import { NgModule     }   from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule,
          Routes }        from '@angular/router';

import { AboutComponent } from './main-content/about/about.component';
import { DocComponent }   from './main-content/doc/doc.component';
import { MapComponent }   from './main-content/map/map.component';
import { DataComponent }  from './main-content/data/data.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: MapComponent },
  { path: 'about', component: AboutComponent },
  { path: 'data', component: DataComponent },
  { path: 'docs', component: DocComponent },
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
