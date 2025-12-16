// cart.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html'
})
export class Cart implements OnInit, OnDestroy {
  cart: any = null;
  totals = { subtotal: 0, tax: 0, shipping: 0, total: 0 };
  isLoading = true;
  
  private cartSub?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    
    // Subscribe to cart updates
    this.cartSub = this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (cart) {
        this.totals = this.cartService.calculateTotals(cart);
      }
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
  }

  // Load cart from backend
  loadCart() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user._id : 'guest';
    
    this.cartService.getCart(userId).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.cart = response.cart;
          this.totals = this.cartService.calculateTotals(this.cart);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
        this.isLoading = false;
      }
    });
  }

  // Update item quantity
  updateQuantity(productId: string, newQuantity: number) {
    if (!this.cart || newQuantity < 1) return;
    
    this.cartService.updateQuantity(this.cart._id, productId, newQuantity).subscribe({
      next: (response) => {
        if (response?.ok) {
          // Cart observable auto-updates
          console.log('Quantity updated');
        }
      },
      error: (err) => console.error('Update quantity failed:', err)
    });
  }

  // Remove item from cart
  removeItem(productId: string) {
    if (!this.cart) return;
    
    this.cartService.removeFromCart(this.cart._id, productId).subscribe({
      next: (response) => {
        if (response?.ok) {
          console.log('Item removed');
        }
      },
      error: (err) => console.error('Remove item failed:', err)
    });
  }

  // Navigate to checkout
  proceedToCheckout() {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      // Redirect to login with return URL
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  // Check if cart has items
  hasItems(): boolean {
    return this.cart && this.cart.items && this.cart.items.length > 0;
  }
}