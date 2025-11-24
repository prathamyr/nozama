import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin',
  imports: [Navbar, MatTabsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {

}
