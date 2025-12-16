import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.serverUrl;

  constructor(private http: HttpClient) {}

  // Create new order
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData, {
      withCredentials: true
    });
  }

  // Get orders for a specific user
  getUserOrders(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/user/${userId}`);
  }

  // Get single order by ID
  getOrder(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}`);
  }
}