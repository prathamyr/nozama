import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../shared/services/admin.service';
import { AuthService } from '../../shared/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html'
})
export class Admin implements OnInit, OnDestroy {
  currentUser: any = null;
  activeTab: 'orders' | 'users' | 'inventory' | 'analytics' = 'orders';

  // Orders
  orders: any[] = [];
  filteredOrders: any[] = [];
  selectedOrder: any = null;
  orderFilters = { userId: '', productId: '', status: '', dateFrom: '', dateTo: '' };

  // Users
  users: any[] = [];
  selectedUser: any = null;
  userEditMode = false;

  // Store original user data for cancel functionality
  private originalUserSnapshot: any = null;

  // Selected user's purchase history
  selectedUserOrders: any[] = [];
  isUserOrdersLoading = false;

  // Product images
  thumbnailFile: File | null = null;
  galleryFiles: File[] = [];
  thumbnailPreviewUrl: string = '';
  galleryPreviewUrls: string[] = [];
  specRows: Array<{ _id: string; key: string; value: string }> = [];

  // Inventory
  products: any[] = [];
  selectedProduct: any = null;
  productEditMode = false;
  newProductMode = false;
  newProduct = {
    name: '',
    slug: '',
    description: '',
    category: '',
    brand: '',
    price: 0,
    stockQuantity: 0,
    thumbnailImg: '',
    isActive: true
  };
  stockUpdate = { quantity: 0, reason: '' };

  // Analytics
  salesStats = {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProduct: '',
    recentOrders: 0
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private subs: Subscription[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check admin access
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.router.navigate(['/home']);
      return;
    }

    this.loadOrders();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  switchTab(tab: 'orders' | 'users' | 'inventory' | 'analytics') {
    this.activeTab = tab;
    this.clearMessages();

    if (tab === 'orders' && this.orders.length === 0) this.loadOrders();
    if (tab === 'users' && this.users.length === 0) this.loadUsers();
    if (tab === 'inventory' && this.products.length === 0) this.loadProducts();
    if (tab === 'analytics') this.calculateAnalytics();
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ========== ORDERS ==========

  loadOrders() {
    this.isLoading = true;
    this.adminService.getAllOrders(this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.orders = response.orders || [];
          this.filteredOrders = this.orders;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load orders failed:', err);
        this.errorMessage = 'Failed to load orders';
        this.isLoading = false;
      }
    });
  }

  // Client-side filtering for orders
  applyOrderFilters() {
    this.filteredOrders = this.orders.filter(order => {
      let match = true;

      // Filter by user email
      if (this.orderFilters.userId) {
        const q = this.orderFilters.userId.trim().toLowerCase();
        const email = (order.userEmail || '').toLowerCase();
        if (!email.includes(q)) match = false;
      }

      // Filter by productId
      if (match && this.orderFilters.productId) {
        const pid = this.orderFilters.productId;
        const hasProduct = (order.itemsOrdered || []).some((it: any) => {
          const itemPid = typeof it.productId === 'object' && it.productId !== null
            ? (it.productId._id ?? it.productId)
            : it.productId;
          return String(itemPid) === String(pid);
        });
        if (!hasProduct) match = false;
      }

      // Filter by status
      if (match && this.orderFilters.status && order.orderStatus !== this.orderFilters.status) {
        match = false;
      }

      // Filter by date range
      if (match && this.orderFilters.dateFrom) {
        const orderDate = new Date(order.createdAt);
        const from = new Date(this.orderFilters.dateFrom);
        if (orderDate < from) match = false;
      }

      if (match && this.orderFilters.dateTo) {
        const orderDate = new Date(order.createdAt);
        const to = new Date(this.orderFilters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (orderDate > to) match = false;
      }

      return match;
    });
  }

  clearOrderFilters() {
    this.orderFilters = { userId: '', productId: '', status: '', dateFrom: '', dateTo: '' };
    this.filteredOrders = this.orders;
  }

  selectOrder(order: any) {
    this.selectedOrder = order;
  }

  approveDeclinedPayment(orderId: string) {
    this.adminService.updateOrderStatus(orderId, 'paid', this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.successMessage = 'Payment approved successfully';
          this.loadOrders();
          this.selectedOrder = null;
        }
      },
      error: (err) => {
        console.error('Approve payment failed:', err);
        this.errorMessage = 'Failed to approve payment';
      }
    });
  }

  // ========== USERS ==========

  loadUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers(this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.users = response.users || [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load users failed:', err);
        this.errorMessage = 'Failed to load users';
        this.isLoading = false;
      }
    });
  }

  // FIXED: Deep clone user to prevent reference issues
  selectUser(user: any) {
    this.selectedUser = this.deepClone(user);
    this.originalUserSnapshot = this.deepClone(user);
    this.ensureUserStructures();
    this.userEditMode = false;
    this.loadSelectedUserOrders();
  }

  // Deep clone helper to avoid reference issues with nested objects
  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
  }

  // Ensure nested structures exist for ngModel bindings
  private ensureUserStructures() {
    if (!this.selectedUser) return;

    if (!this.selectedUser.shippingAddress) {
      this.selectedUser.shippingAddress = this.makeEmptyAddress('shipping');
    } else if (!this.selectedUser.shippingAddress.addressType) {
      this.selectedUser.shippingAddress.addressType = 'shipping';
    }

    if (!this.selectedUser.billingAddress) {
      this.selectedUser.billingAddress = this.makeEmptyAddress('billing');
    } else if (!this.selectedUser.billingAddress.addressType) {
      this.selectedUser.billingAddress.addressType = 'billing';
    }

    if (!Array.isArray(this.selectedUser.paymentMethods)) {
      this.selectedUser.paymentMethods = [];
    }
  }

  private makeEmptyAddress(type: 'shipping' | 'billing') {
    return {
      addressType: type,
      fullName: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    };
  }

  private makeEmptyPaymentMethod(isDefault: boolean) {
    return {
      cardBrand: '',
      cardNumber: '',
      last4: '',
      expiryMonth: null,
      expiryYear: null,
      label: '',
      isDefault
    };
  }

  loadSelectedUserOrders() {
    if (!this.selectedUser?._id) return;

    this.isUserOrdersLoading = true;
    this.selectedUserOrders = [];

    this.adminService.getUserOrders(this.selectedUser._id, this.currentUser._id).subscribe({
      next: (response) => {
        this.selectedUserOrders = response?.orders || [];
        this.isUserOrdersLoading = false;
      },
      error: (err) => {
        console.error('Load user orders failed:', err);
        this.isUserOrdersLoading = false;
      }
    });
  }

  addPaymentMethodSlot() {
    if (!this.selectedUser) return;
    if (!Array.isArray(this.selectedUser.paymentMethods)) this.selectedUser.paymentMethods = [];
    this.selectedUser.paymentMethods.push(this.makeEmptyPaymentMethod(false));
  }

  removePaymentMethodSlot(idx: number) {
    if (!this.selectedUser?.paymentMethods) return;
    this.selectedUser.paymentMethods.splice(idx, 1);
  }

  setDefaultPaymentMethod(idx: number) {
    if (!this.selectedUser?.paymentMethods) return;
    this.selectedUser.paymentMethods.forEach((pm: any, i: number) => pm.isDefault = i === idx);
  }

  editUser() {
    this.userEditMode = true;
    this.ensureUserStructures();
  }

  // FIXED: Save user with proper sequential API calls
  saveUser() {
    if (!this.selectedUser) return;

    // Derive last4 from cardNumber for each payment method
    if (Array.isArray(this.selectedUser.paymentMethods)) {
      for (const pm of this.selectedUser.paymentMethods) {
        if (pm?.cardNumber) {
          const digits = String(pm.cardNumber).replace(/\D/g, '');
          pm.last4 = digits.slice(-4);
        }
      }
    }

    // Step 1: Update basic profile info (firstname, lastname, email)
    const basicPayload = {
      firstname: this.selectedUser.firstname,
      lastname: this.selectedUser.lastname,
      email: this.selectedUser.email
    };

    this.adminService.updateUser(this.selectedUser._id, basicPayload, this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          // Step 2: Update shipping address
          this.saveShippingAddress();
        } else {
          this.errorMessage = 'Failed to update basic info';
        }
      },
      error: (err) => {
        console.error('Update user basic info failed:', err);
        this.errorMessage = 'Failed to update user';
      }
    });
  }

  private saveShippingAddress() {
    const shippingAddr = { ...this.selectedUser.shippingAddress, addressType: 'shipping' };

    this.adminService.updateUserAddress(
      this.selectedUser._id,
      'shipping',
      shippingAddr,
      this.currentUser._id
    ).subscribe({
      next: (response) => {
        if (response?.ok) {
          // Step 3: Update billing address
          this.saveBillingAddress();
        } else {
          this.errorMessage = 'Failed to update shipping address';
        }
      },
      error: (err) => {
        console.error('Update shipping address failed:', err);
        this.errorMessage = 'Failed to update shipping address';
      }
    });
  }

  private saveBillingAddress() {
    const billingAddr = { ...this.selectedUser.billingAddress, addressType: 'billing' };

    this.adminService.updateUserAddress(
      this.selectedUser._id,
      'billing',
      billingAddr,
      this.currentUser._id
    ).subscribe({
      next: (response) => {
        if (response?.ok) {
          // Step 4: Handle payment methods
          this.savePaymentMethods();
        } else {
          this.errorMessage = 'Failed to update billing address';
        }
      },
      error: (err) => {
        console.error('Update billing address failed:', err);
        this.errorMessage = 'Failed to update billing address';
      }
    });
  }

  private savePaymentMethods() {
    // Get original and current payment methods
    const originalPMs = this.originalUserSnapshot?.paymentMethods || [];
    const currentPMs = this.selectedUser.paymentMethods || [];

    // Find payment methods to remove (in original but not in current)
    const currentIds = new Set(currentPMs.map((pm: any) => pm._id).filter(Boolean));
    const toRemove = originalPMs.filter((pm: any) => pm._id && !currentIds.has(pm._id));

    // Find new payment methods (no _id means they're new)
    const toAdd = currentPMs.filter((pm: any) => !pm._id && pm.cardNumber);

    // Process removals first, then additions
    this.processPaymentRemovals(toRemove, () => {
      this.processPaymentAdditions(toAdd, () => {
        // All done - reload and show success
        this.successMessage = 'User updated successfully';
        this.loadUsers();
        this.userEditMode = false;
        this.loadSelectedUserOrders();
      });
    });
  }

  private processPaymentRemovals(toRemove: any[], onComplete: () => void) {
    if (toRemove.length === 0) {
      onComplete();
      return;
    }

    const pm = toRemove[0];
    this.adminService.removeUserPaymentMethod(
      this.selectedUser._id,
      pm._id,
      this.currentUser._id
    ).subscribe({
      next: () => {
        // Process next removal
        this.processPaymentRemovals(toRemove.slice(1), onComplete);
      },
      error: (err) => {
        console.error('Remove payment method failed:', err);
        // Continue anyway
        this.processPaymentRemovals(toRemove.slice(1), onComplete);
      }
    });
  }

  private processPaymentAdditions(toAdd: any[], onComplete: () => void) {
    if (toAdd.length === 0) {
      onComplete();
      return;
    }

    const pm = toAdd[0];
    this.adminService.addUserPaymentMethod(
      this.selectedUser._id,
      pm,
      this.currentUser._id
    ).subscribe({
      next: () => {
        // Process next addition
        this.processPaymentAdditions(toAdd.slice(1), onComplete);
      },
      error: (err) => {
        console.error('Add payment method failed:', err);
        // Continue anyway
        this.processPaymentAdditions(toAdd.slice(1), onComplete);
      }
    });
  }

  cancelUserEdit() {
    this.userEditMode = false;
    // Restore original user data
    if (this.originalUserSnapshot) {
      this.selectedUser = this.deepClone(this.originalUserSnapshot);
      this.ensureUserStructures();
    } else {
      this.selectedUser = null;
      this.selectedUserOrders = [];
    }
  }

  // ========== INVENTORY ==========

  loadProducts() {
    this.isLoading = true;
    this.adminService.getAllProducts(this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.products = response.products || [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load products failed:', err);
        this.errorMessage = 'Failed to load products';
        this.isLoading = false;
      }
    });
  }

  selectProduct(product: any) {
    this.selectedProduct = { ...product };
    this.productEditMode = false;
    this.stockUpdate = { quantity: product.stockQuantity, reason: '' };
  }

  editProduct() {
    this.productEditMode = true;
  }

  saveProduct() {
    if (!this.selectedProduct) return;

    this.adminService.updateProduct(this.selectedProduct._id, this.selectedProduct, this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.successMessage = 'Product updated successfully';
          this.loadProducts();
          this.productEditMode = false;
        }
      },
      error: (err) => {
        console.error('Update product failed:', err);
        this.errorMessage = 'Failed to update product';
      }
    });
  }

  updateStock() {
    if (!this.selectedProduct) return;

    this.adminService.updateStock(
      this.selectedProduct._id,
      this.stockUpdate.quantity,
      this.currentUser._id,
      'RESTOCK',
      this.stockUpdate.reason
    ).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.successMessage = 'Stock updated successfully';
          this.loadProducts();
          this.selectedProduct = null;
        }
      },
      error: (err) => {
        console.error('Update stock failed:', err);
        this.errorMessage = 'Failed to update stock';
      }
    });
  }

  showNewProductForm() {
    this.newProductMode = true;
    this.selectedProduct = null;
  }

  createProduct() {
    // Generate slug from name
    this.newProduct.slug = this.newProduct.name.toLowerCase().replace(/\s+/g, '-');

    const hasUploads = !!this.thumbnailFile || this.galleryFiles.length > 0 || this.specRows.length > 0;

    if (!hasUploads) {
      this.adminService.createProduct(this.newProduct, this.currentUser._id).subscribe({
        next: (response) => {
          if (response?.ok) {
            this.successMessage = 'Product created successfully';
            this.loadProducts();
            this.newProductMode = false;
            this.resetNewProduct();
          }
        },
        error: (err) => {
          console.error('Create product failed:', err);
          this.errorMessage = 'Failed to create product';
        }
      });
      return;
    }

    const fd = new FormData();
    fd.append('name', this.newProduct.name);
    fd.append('slug', this.newProduct.slug);
    fd.append('description', this.newProduct.description || '');
    fd.append('category', this.newProduct.category || '');
    fd.append('brand', this.newProduct.brand || '');
    fd.append('price', String(this.newProduct.price ?? 0));
    fd.append('stockQuantity', String(this.newProduct.stockQuantity ?? 0));
    fd.append('isActive', String(this.newProduct.isActive ?? true));

    if (this.newProduct.thumbnailImg) {
      fd.append('thumbnailImg', this.newProduct.thumbnailImg);
    }

    const specsObj = this.buildSpecsObject();
    fd.append('specsJson', JSON.stringify(specsObj));

    if (this.thumbnailFile) {
      fd.append('thumbnail', this.thumbnailFile);
    }
    for (const f of this.galleryFiles) {
      fd.append('gallery', f);
    }

    this.adminService.createProduct(fd, this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.successMessage = 'Product created successfully';
          this.loadProducts();
          this.newProductMode = false;
          this.resetNewProduct();
        }
      },
      error: (err) => {
        console.error('Create product failed:', err);
        this.errorMessage = 'Failed to create product';
      }
    });
  }

  onThumbnailSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.thumbnailFile = file;
    this.thumbnailPreviewUrl = file ? URL.createObjectURL(file) : '';
  }

  onGallerySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.galleryFiles = files.slice(0, 8);
    this.galleryPreviewUrls = this.galleryFiles.map(f => URL.createObjectURL(f));
  }

  addSpecRow() {
    this.specRows.push({
      _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      key: '',
      value: ''
    });
  }

  removeSpecRow(id: string) {
    this.specRows = this.specRows.filter(r => r._id !== id);
  }

  private buildSpecsObject(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const r of this.specRows) {
      const k = (r.key || '').trim();
      const v = (r.value || '').trim();
      if (k) out[k] = v;
    }
    return out;
  }

  cancelProductEdit() {
    this.productEditMode = false;
    this.newProductMode = false;
    this.selectedProduct = null;
    this.resetNewProduct();
  }

  resetNewProduct() {
    this.newProduct = {
      name: '',
      slug: '',
      description: '',
      category: '',
      brand: '',
      price: 0,
      stockQuantity: 0,
      thumbnailImg: '',
      isActive: true
    };
    this.thumbnailFile = null;
    this.galleryFiles = [];
    this.thumbnailPreviewUrl = '';
    this.galleryPreviewUrls = [];
    this.specRows = [];
  }

  // ========== ANALYTICS ==========

  calculateAnalytics() {
    if (this.orders.length === 0) {
      this.loadOrders();
      return;
    }

    const paidOrders = this.orders.filter(o => o.orderStatus === 'paid' || o.paymentDetails?.paymentStatus === 'Approved');

    this.salesStats.totalOrders = paidOrders.length;
    this.salesStats.totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    this.salesStats.avgOrderValue = paidOrders.length > 0 ? this.salesStats.totalRevenue / paidOrders.length : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    this.salesStats.recentOrders = paidOrders.filter(o => new Date(o.createdAt) > sevenDaysAgo).length;

    const productCounts: { [key: string]: number } = {};
    paidOrders.forEach(order => {
      order.itemsOrdered?.forEach((item: any) => {
        productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
      });
    });

    const topProductEntry = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
    this.salesStats.topProduct = topProductEntry ? topProductEntry[0] : 'N/A';
  }

  exportSalesReport() {
    const paidOrders = this.orders.filter(o => o.orderStatus === 'paid');

    let csv = 'Order ID,Date,Customer,Total,Status\n';
    paidOrders.forEach(order => {
      csv += `${order._id},${new Date(order.createdAt).toLocaleDateString()},${order.userEmail},${order.totalAmount},${order.orderStatus}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${Date.now()}.csv`;
    a.click();

    this.successMessage = 'Report exported successfully';
  }
}