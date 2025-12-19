import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.serverUrl;
  
  // Observable cart for components to subscribe to
  private cartSubject = new BehaviorSubject<any>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get cart for user or guest
  getCart(userId: string = 'guest'): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart/${userId}`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response && (response as any).cart) {
          this.cartSubject.next((response as any).cart);
        }
      })
    );
  }

  // Add item to cart
  addToCart(cartId: string, productId: string, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart/${cartId}/items`, 
      { productId, quantity },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response && (response as any).cart) {
          this.cartSubject.next((response as any).cart);
        }
      })
    );
  }

  // Remove item from cart
  removeFromCart(cartId: string, productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${cartId}/items/${productId}`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response && (response as any).cart) {
          this.cartSubject.next((response as any).cart);
        }
      })
    );
  }

  // Update item quantity
  updateQuantity(cartId: string, productId: string, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart/${cartId}/items`, 
      { productId, quantity },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response && (response as any).cart) {
          this.cartSubject.next((response as any).cart);
        }
      })
    );
  }

  // Clear cart (set to null)
  clearCart(): void {
    this.cartSubject.next(null);
  }

  // Calculate cart totals
  calculateTotals(cart: any): { subtotal: number; tax: number; shipping: number; total: number } {
    if (!cart || !cart.items || cart.items.length === 0) {
      return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    }

    const subtotal = cart.items.reduce((sum: number, item: any) => 
      sum + (item.productId.price * item.quantity), 0
    );
    
    const tax = subtotal * 0.13; // 13% tax
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  }

  setCart(cart: any): void {
  this.cartSubject.next(cart);
  }
}