import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: true,
  imports: [RouterModule]
})
export class AppComponent implements OnInit {
  ngOnInit() {
    const users = [
      { email: 'admin@example.com', password: 'admin', role: 'Admin' },
      { email: 'user@example.com', password: 'user', role: 'User' }
    ];

    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }
}
