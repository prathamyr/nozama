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
    cardBrand: 'Visa',
    cardExpiryMonth: '',
    cardExpiryYear: '',
    cardCVC: '',
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

  // Toggle same as shipping - FIX: sync addresses properly
  toggleSameAsShipping(checked: boolean) {
    if (checked) {
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
      payment.cardBrand.trim() !== '' &&
      payment.cardExpiryMonth.trim() !== '' &&
      payment.cardExpiryYear.trim() !== '' &&
      payment.cardCVC.trim() !== ''
    );
  }

  isCardExpired(month: string, year: string): boolean {
  const expMonth = parseInt(month, 10);
  const expYear = 2000 + parseInt(year, 10); // "25" → 2025
  
  // Validate month range
  if (expMonth < 1 || expMonth > 12) {
    return true; // Invalid month = expired
  }
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  // Card expires at END of month, not beginning
  if (expYear < currentYear) return true;
  if (expYear === currentYear && expMonth < currentMonth) return true;
  
  return false;
  }

  // Place order
  placeOrder() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const month = parseInt(this.billingInfo.cardExpiryMonth, 10);
    if (month < 1 || month > 12) {
    this.errorMessage = 'Invalid expiry month. Enter 01-12.';
    return;
    }

    if (this.isCardExpired(this.billingInfo.cardExpiryMonth, this.billingInfo.cardExpiryYear)) {
      this.errorMessage = 'Your card is expired. Please use a valid card.';
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
          this.router.navigate(['/home']);
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