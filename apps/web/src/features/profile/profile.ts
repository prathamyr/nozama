// profile.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { OrderService } from '../../shared/services/order.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html'
})
export class Profile implements OnInit, OnDestroy {
  currentUser: any = null;
  activeTab: 'info' | 'orders' | 'wishlist' | 'payment' = 'info';
  
  // Profile info
  profileEdit = false;
  profileData = { firstname: '', lastname: '', email: '' };
  
  // Addresses
  addressEdit = false;
  useSameAddress = false;
  shippingAddress = {
    fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Canada'
  };
  billingAddress = {
    fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Canada'
  };
  
  // Orders
  orders: any[] = [];
  selectedOrder: any = null;
  
  // Wishlist
  wishlist: any[] = [];
  
  // Payment methods
  paymentMethods: any[] = [];
  newPayment = {
    cardBrand: 'Visa',
    cardNumber: '',
    expiryMonth: 1,
    expiryYear: 2025,
    label: '',
    isDefault: false
  };
  showPaymentForm = false;
  
  // State
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  private apiUrl = environment.serverUrl;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadProfile();
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  // Get auth headers
  getHeaders() {
    return { headers: { 'x-user-id': this.currentUser._id } };
  }

  switchTab(tab: 'info' | 'orders' | 'wishlist' | 'payment') {
    this.activeTab = tab;
    this.clearMessages();
    
    if (tab === 'orders' && this.orders.length === 0) this.loadOrders();
    if (tab === 'wishlist' && this.wishlist.length === 0) this.loadWishlist();
    if (tab === 'payment' && this.paymentMethods.length === 0) this.loadPaymentMethods();
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ========== PROFILE INFO ==========
  
  loadProfile() {
    this.isLoading = true;
    this.http.get(`${this.apiUrl}/users/${this.currentUser._id}`, this.getHeaders()).subscribe({
      next: (response: any) => {
        if (response?.ok) {
          const user = response.user;
          this.profileData = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
          };
          this.shippingAddress = user.shippingAddress || this.shippingAddress;
          this.billingAddress = user.billingAddress || this.billingAddress;
          this.wishlist = user.wishlist || [];
          this.paymentMethods = user.paymentMethods || [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load profile failed:', err);
        this.errorMessage = 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  toggleProfileEdit() {
    this.profileEdit = !this.profileEdit;
    if (!this.profileEdit) {
      // Reset to current values
      this.loadProfile();
    }
  }

  saveProfile() {
    this.http.put(`${this.apiUrl}/users/${this.currentUser._id}`, 
      this.profileData, 
      this.getHeaders()
    ).subscribe({
      next: (response: any) => {
        if (response?.ok) {
          this.successMessage = 'Profile updated successfully';
          this.profileEdit = false;
          // Update localStorage
          const updatedUser = { ...this.currentUser, ...this.profileData };
          this.authService.setCurrentUser(updatedUser);
          this.currentUser = updatedUser;
        }
      },
      error: (err) => {
        console.error('Update profile failed:', err);
        this.errorMessage = 'Failed to update profile';
      }
    });
  }

  toggleAddressEdit() {
    this.addressEdit = !this.addressEdit;
    if (!this.addressEdit) {
      this.useSameAddress = false;
      this.loadProfile();
    }
  }

  toggleSameAddress() {
  if (this.useSameAddress) {
    this.billingAddress = { ...this.shippingAddress };
  }
  }

  onSameAddressChange(checked: boolean) {
  this.useSameAddress = checked;
  if (checked) this.billingAddress = { ...this.shippingAddress };
  }

  saveAddresses() {
    const shippingPayload = { ...this.shippingAddress, addressType: 'shipping' };
    const billingPayload = { ...this.billingAddress, addressType: 'billing' };

    // Update shipping
    this.http.put(`${this.apiUrl}/users/${this.currentUser._id}/address`,
      { type: 'shipping', address: shippingPayload },
      this.getHeaders()
    ).subscribe({
      next: (response: any) => {
        if (response?.ok) {
          // Update billing
          this.http.put(`${this.apiUrl}/users/${this.currentUser._id}/address`,
            { type: 'billing', address: billingPayload },
            this.getHeaders()
          ).subscribe({
            next: () => {
              this.successMessage = 'Addresses updated successfully';
              this.addressEdit = false;
              this.useSameAddress = false;
            },
            error: (err) => {
              console.error('Update billing failed:', err);
              this.errorMessage = 'Failed to update billing address';
            }
          });
        }
      },
      error: (err) => {
        console.error('Update shipping failed:', err);
        this.errorMessage = 'Failed to update shipping address';
      }
    });
  }

  // ========== ORDERS ==========
  
  loadOrders() {
    this.orderService.getUserOrders(this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.orders = response.orders || [];
        }
      },
      error: (err) => {
        console.error('Load orders failed:', err);
        this.errorMessage = 'Failed to load orders';
      }
    });
  }

  viewOrder(order: any) {
    this.selectedOrder = order;
  }

  // ========== WISHLIST ==========
  
  loadWishlist() {
    // Wishlist already loaded in profile
  }

  removeFromWishlist(productId: string) {
    this.http.delete(`${this.apiUrl}/users/${this.currentUser._id}/wishlist/${productId}`,
      this.getHeaders()
    ).subscribe({
      next: (response: any) => {
        if (response?.ok) {
          this.wishlist = response.user.wishlist || [];
          this.successMessage = 'Removed from wishlist';
        }
      },
      error: (err) => {
        console.error('Remove from wishlist failed:', err);
        this.errorMessage = 'Failed to remove from wishlist';
      }
    });
  }

  // ========== PAYMENT METHODS ==========
  
  loadPaymentMethods() {
    // Already loaded in profile
  }

  togglePaymentForm() {
    this.showPaymentForm = !this.showPaymentForm;
    if (!this.showPaymentForm) {
      this.resetPaymentForm();
    }
  }

  addPaymentMethod() {
    const digits = (this.newPayment.cardNumber || '').replace(/\s+/g, '');
    if (digits.length < 12) {
      this.errorMessage = 'Please enter a valid card number';
      return;
    }

    const payload = {
      ...this.newPayment,
      cardNumber: digits,
      last4: digits.slice(-4)
    };

    this.http.post(`${this.apiUrl}/users/${this.currentUser._id}/payment-methods`,
      payload,
      this.getHeaders()
    ).subscribe({
      next: (response: any) => {
        if (response?.ok) {
          this.paymentMethods = response.user.paymentMethods || [];
          this.successMessage = 'Payment method added';
          this.togglePaymentForm();
        }
      },
      error: (err) => {
        console.error('Add payment failed:', err);
        this.errorMessage = 'Failed to add payment method';
      }
    });
  }

  removePaymentMethod(paymentId: string) {
    this.http.delete(`${this.apiUrl}/users/${this.currentUser._id}/payment-methods/${paymentId}`,
      this.getHeaders()
    ).subscribe({
      next: (response: any) => {
        if (response?.ok) {
          this.paymentMethods = response.user.paymentMethods || [];
          this.successMessage = 'Payment method removed';
        }
      },
      error: (err) => {
        console.error('Remove payment failed:', err);
        this.errorMessage = 'Failed to remove payment method';
      }
    });
  }

  resetPaymentForm() {
    this.newPayment = {
      cardBrand: 'Visa', cardNumber: '', expiryMonth: 1, expiryYear: 2025, label: '', isDefault: false
    };
  }
}