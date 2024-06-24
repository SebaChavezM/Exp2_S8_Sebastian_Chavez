import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <h1>Hello, {{ title }}</h1>
    <router-outlet></router-outlet>
  `,
  standalone: true,
  imports: [RouterModule, NavbarComponent]
})
export class AppComponent {
  title = 'erp-praxa';
}
