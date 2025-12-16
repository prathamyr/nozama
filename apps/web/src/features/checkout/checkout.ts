// checkout.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../shared/services/cart.service';
import { OrderService } from '../../shared/services/order.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  // Current cart and totals
  cart: any = null;
  totals = { subtotal: 0, tax: 0, shipping: 0, total: 0 };
  
  // Form data
  shippingAddress = {
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Canada'
  };
  
  billingAddress = {
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Canada'
  };
  
  billingInfo = {
    cardNumber: '',
    cardBrand: 'Visa'
  };
  
  sameAsShipping = true;
  
  // State
  isProcessing = false;
  errorMessage = '';
  currentUser: any = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is logged in
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    
    this.loadCart();
  }

  // Load cart
  loadCart() {
    this.cartService.getCart(this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.cart = response.cart;
          this.totals = this.cartService.calculateTotals(this.cart);
          
          // Check if cart is empty
          if (!this.cart.items || this.cart.items.length === 0) {
            this.router.navigate(['/cart']);
          }
        }
      },
      error: (err) => console.error('Failed to load cart:', err)
    });
  }

  // Toggle same as shipping
  toggleSameAsShipping() {
    this.sameAsShipping = !this.sameAsShipping;
    if (this.sameAsShipping) {
      this.billingAddress = { ...this.shippingAddress };
    }
  }

  // Validate form
  isFormValid(): boolean {
    const shipping = this.shippingAddress;
    const billing = this.sameAsShipping ? shipping : this.billingAddress;
    const payment = this.billingInfo;
    
    return (
      shipping.fullName.trim() !== '' &&
      shipping.line1.trim() !== '' &&
      shipping.city.trim() !== '' &&
      shipping.state.trim() !== '' &&
      shipping.postalCode.trim() !== '' &&
      billing.fullName.trim() !== '' &&
      billing.line1.trim() !== '' &&
      billing.city.trim() !== '' &&
      billing.state.trim() !== '' &&
      billing.postalCode.trim() !== '' &&
      payment.cardNumber.trim() !== '' &&
      payment.cardBrand.trim() !== ''
    );
  }

  // Place order
  placeOrder() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    
    this.isProcessing = true;
    this.errorMessage = '';
    
    const orderData = {
      userId: this.currentUser._id,
      shippingAddress: this.shippingAddress,
      billingAddress: this.sameAsShipping ? this.shippingAddress : this.billingAddress,
      billingInfo: this.billingInfo
    };
    
    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        if (response?.ok && response.order) {
          // Success - redirect to order confirmation
          this.router.navigate(['/order-confirmation', response.order._id]);
        } else {
          this.errorMessage = response.error || 'Order failed. Please try again.';
          this.isProcessing = false;
        }
      },
      error: (err) => {
        console.error('Order error:', err);
        
        // Check if payment was declined (402 status)
        if (err.status === 402) {
          this.errorMessage = 'Payment declined. Please check your card details and try again.';
        } else {
          this.errorMessage = err.error?.error || 'Order failed. Please try again.';
        }
        
        this.isProcessing = false;
      }
    });
  }
}