import { Component, OnInit } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-product',
  imports: [Navbar],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product implements OnInit {
  products: any[] = [];

  ngOnInit() { // retrieves all products whenever the component loads
    this.getProducts();
  }

  async getProducts() {
    try {
      const response = await fetch(`${environment.serverUrl}/products`);
      const data = await response.json(); // If the backend returns res.json(), this is correct
      this.products = data.products;
      console.log(this.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      this.products = [];
    }
  }
}
