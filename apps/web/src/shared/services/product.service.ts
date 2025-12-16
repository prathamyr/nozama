import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.serverUrl;

  constructor(private http: HttpClient) {}

  // Get all products
  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`);
  }

  // Get single product by ID
  getProduct(productId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${productId}`);
  }

  // Search products by keyword
  searchProducts(keyword: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/search?keyword=${keyword}`);
  }

  // Filter products (category, brand, price range)
  filterProducts(filters: { category?: string; brand?: string; minPrice?: number; maxPrice?: number }): Observable<any> {
    let params = new HttpParams();
    
    if (filters.category) params = params.set('category', filters.category);
    if (filters.brand) params = params.set('brand', filters.brand);
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    
    return this.http.get(`${this.apiUrl}/products/filter`, { params });
  }

  // Sort products
  sortProducts(sortBy: string, order: 'asc' | 'desc'): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/sort?sortBy=${sortBy}&order=${order}`);
  }
}