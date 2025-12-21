import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../shared/services/cart.service';
import { OrderService } from '../../shared/services/order.service';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  private apiUrl = environment.serverUrl;

  cart: any = null;
  totals = { subtotal: 0, tax: 0, shipping: 0, total: 0 };

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



  // NEW: saved payment methods + selector
  savedPaymentMethods: any[] = [];
  selectedPaymentId: string | null = null;
  paymentMode: 'saved' | 'new' = 'new';
  savedCardLast4 = '';

  isProcessing = false;
  errorMessage = '';
  currentUser: any = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.loadCart();
    this.prefillFromProfile(); // NEW
  }

  private mergeAddress(base: any, saved: any): any {
    if (!saved) return base;
    // Drop addressType if it exists on User model; checkout doesn't need it
    const { addressType, ...rest } = saved || {};
    return { ...base, ...rest, country: rest.country || base.country };
  }

  private addressesEqual(a: any, b: any): boolean {
    const keys = ['fullName', 'line1', 'line2', 'city', 'state', 'postalCode', 'country'];
    return keys.every(k => (a?.[k] || '') === (b?.[k] || ''));
  }

  prefillFromProfile() {
    this.http.get(`${this.apiUrl}/users/${this.currentUser._id}`).subscribe({
      next: (res: any) => {
        if (!res?.ok || !res.user) return;

        const user = res.user;

        // Addresses
        this.shippingAddress = this.mergeAddress(this.shippingAddress, user.shippingAddress);

        if (user.billingAddress) {
          this.billingAddress = this.mergeAddress(this.billingAddress, user.billingAddress);
          this.sameAsShipping = this.addressesEqual(this.shippingAddress, this.billingAddress);
          if (this.sameAsShipping) {
            this.billingAddress = { ...this.shippingAddress };
          }
        } else {
          // If no billing saved, default to "same as shipping"
          this.sameAsShipping = true;
          this.billingAddress = { ...this.shippingAddress };
        }

        // Payment methods
        this.savedPaymentMethods = user.paymentMethods || [];
        const defaultPm =
          this.savedPaymentMethods.find((p: any) => p.isDefault) || this.savedPaymentMethods[0];

        if (defaultPm?._id) {
          this.selectedPaymentId = defaultPm._id;
          this.paymentMode = 'saved';
          this.applySavedPayment(defaultPm._id);
        } else {
          this.paymentMode = 'new';
        }
      },
      error: (err) => {
        // Don't block checkout if profile fetch fails; just don't prefill.
        console.error('Prefill profile failed:', err);
      }
    });
  }

  applySavedPayment(paymentId: string) {
    const pm = this.savedPaymentMethods.find(p => p._id === paymentId);
    if (!pm) return;

    this.paymentMode = 'saved';

    this.savedCardLast4 = pm.last4 || '';

    this.billingInfo.cardBrand = pm.cardBrand || 'Visa';
    this.billingInfo.cardExpiryMonth = pm.expiryMonth ? String(pm.expiryMonth).padStart(2, '0') : '';
    this.billingInfo.cardExpiryYear = pm.expiryYear ? String(pm.expiryYear).slice(-2) : '';

    // IMPORTANT:
    // We still send a cardNumber so your existing validation + payment mock can work,
    // but we will NOT bind this to the visible input in "saved" mode.
    const last4 = (pm.last4 || '').toString().slice(-4);
    this.billingInfo.cardNumber = last4 ? `000000000000${last4}` : '0000000000000000';

    // Require re-entry for security / realism
    this.billingInfo.cardCVC = '';
  }

  useNewCard() {
    this.paymentMode = 'new';
    this.selectedPaymentId = null;
    this.savedCardLast4 = '';

    this.billingInfo = {
      cardNumber: '',
      cardBrand: 'Visa',
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardCVC: ''
    };
  }

  useSavedCard() {
    this.paymentMode = 'saved';

    // If nothing selected yet, select default/first and apply it
    if (!this.selectedPaymentId && this.savedPaymentMethods.length > 0) {
      const def = this.savedPaymentMethods.find(p => p.isDefault) || this.savedPaymentMethods[0];
      this.selectedPaymentId = def._id;
    }

    if (this.selectedPaymentId) {
      this.applySavedPayment(this.selectedPaymentId);
    }
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