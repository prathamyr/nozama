import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html'
})

export class Footer {
  currentYear: number = new Date().getFullYear();
}