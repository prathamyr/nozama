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

  // Saved payment methods
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
    this.prefillFromProfile();
  }

  private mergeAddress(base: any, saved: any): any {
    if (!saved) return base;
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

    // Mask card number
    // We only store last4, so we mask the rest
    // e.g. if last4 is 1234, we set cardNumber to 0000000000001234
    const last4 = (pm.last4 || '').toString().slice(-4);
    this.billingInfo.cardNumber = last4 ? `000000000000${last4}` : '0000000000000000';

    // require CVC for security
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

    //if nothing selected, pick default or first and apply
    if (!this.selectedPaymentId && this.savedPaymentMethods.length > 0) {
      const def = this.savedPaymentMethods.find(p => p.isDefault) || this.savedPaymentMethods[0];
      this.selectedPaymentId = def._id;
    }

    if (this.selectedPaymentId) {
      this.applySavedPayment(this.selectedPaymentId);
    }
  }

  loadCart() {
    this.cartService.getCart(this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.cart = response.cart;
          this.totals = this.cartService.calculateTotals(this.cart);
          
          // Redirect to cart if empty
          if (!this.cart.items || this.cart.items.length === 0) {
            this.router.navigate(['/cart']);
          }
        }
      },
      error: (err) => console.error('Failed to load cart:', err)
    });
  }

  // Toggle billing address same as shipping -> fix: sync billing address
  toggleSameAsShipping(checked: boolean) {
    if (checked) {
      this.billingAddress = { ...this.shippingAddress };
    }
  } 

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
    const expYear = 2000 + parseInt(year, 10);
    
    if (expMonth < 1 || expMonth > 12) {
      return true;
    }
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    if (expYear < currentYear) return true;
    if (expYear === currentYear && expMonth < currentMonth) return true;
    
    return false;
  }

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
          // Clear cart state BEFORE navigating so navbar updates immediately
          this.cartService.clearCart();
          // Redirect to order confirmation
          this.router.navigate(['/order-confirmation', response.order._id]);
        } else {
          this.errorMessage = response.error || 'Order failed. Please try again.';
          this.isProcessing = false;
        }
      },
      error: (err) => {
        console.error('Order error:', err);
        
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