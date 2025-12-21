import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.serverUrl;

  constructor(private http: HttpClient) {}

  // Get headers with user ID
  private getHeaders(userId: string): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'x-user-id': userId
      })
    };
  }

  // ========== ORDERS ==========
  
  getAllOrders(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/orders`, this.getHeaders(userId));
  }

  updateOrderStatus(orderId: string, status: string, userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/orders/${orderId}/status`, 
      { status }, 
      this.getHeaders(userId)
    );
  }

  // ========== INVENTORY ==========
  
  getAllProducts(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products`, this.getHeaders(userId));
  }

  createProduct(productData: any, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/products`, 
      productData, 
      this.getHeaders(userId)
    );
  }

  updateProduct(productId: string, productData: any, userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/products/${productId}`, 
      productData, 
      this.getHeaders(userId)
    );
  }

  updateStock(productId: string, quantity: number, adminId: string, actionType: string = 'RESTOCK', reason?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/inventory/${productId}`, 
      { quantity, adminId, actionType, reason },
      this.getHeaders(adminId)
    );
  }

  getInventoryLogs(productId: string | undefined, userId: string): Observable<any> {
    const url = productId 
      ? `${this.apiUrl}/admin/inventory-logs/product/${productId}`
      : `${this.apiUrl}/admin/inventory-logs`;
    return this.http.get(url, this.getHeaders(userId));
  }

  // ========== USERS ==========
  
  getAllUsers(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users`, this.getHeaders(userId));
  }

  updateUser(targetUserId: string, userData: any, adminUserId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${targetUserId}`, 
      userData, 
      this.getHeaders(adminUserId)
    );
  }

  getUserOrders(targetUserId: string, adminUserId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/${targetUserId}/orders`, 
      this.getHeaders(adminUserId)
    );
  }

  // FIXED: Added <any> return type to fix TypeScript errors
  updateUserAddress(userId: string, type: 'billing' | 'shipping', address: any, adminId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/users/${userId}/address`,
      { type, address },
      this.getHeaders(adminId)
    );
  }

  // FIXED: Added <any> return type
  addUserPaymentMethod(userId: string, paymentData: any, adminId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/users/${userId}/payment-methods`,
      paymentData,
      this.getHeaders(adminId)
    );
  }

  // FIXED: Added <any> return type
  removeUserPaymentMethod(userId: string, paymentId: string, adminId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/users/${userId}/payment-methods/${paymentId}`,
      this.getHeaders(adminId)
    );
  }

  updateUserPaymentMethod(userId: string, paymentId: string, paymentData: any, adminId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/users/${userId}/payment-methods/${paymentId}`,
      paymentData,
      this.getHeaders(adminId)
    );
  }
}