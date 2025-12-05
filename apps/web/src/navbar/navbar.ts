import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  user:any = null;

  ngOnInit() {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        this.user = JSON.parse(userString);
      } catch (e) {
        this.user = null;
      }
    }
  }

  logout() {
    localStorage.removeItem("cart");
    localStorage.removeItem("user");
    window.location.replace("/");
  }
}
