// admin.ts
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
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  // Switch tabs
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

  applyOrderFilters() {
    this.filteredOrders = this.orders.filter(order => {
      let match = true;
      
      if (this.orderFilters.status && order.orderStatus !== this.orderFilters.status) {
        match = false;
      }
      
      if (this.orderFilters.dateFrom) {
        const orderDate = new Date(order.createdAt);
        const filterDate = new Date(this.orderFilters.dateFrom);
        if (orderDate < filterDate) match = false;
      }
      
      if (this.orderFilters.dateTo) {
        const orderDate = new Date(order.createdAt);
        const filterDate = new Date(this.orderFilters.dateTo);
        if (orderDate > filterDate) match = false;
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

  selectUser(user: any) {
    this.selectedUser = { ...user };
    this.userEditMode = false;
  }

  editUser() {
    this.userEditMode = true;
  }

  saveUser() {
    if (!this.selectedUser) return;
    
    this.adminService.updateUser(this.selectedUser._id, this.selectedUser, this.currentUser._id).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.successMessage = 'User updated successfully';
          this.loadUsers();
          this.userEditMode = false;
        }
      },
      error: (err) => {
        console.error('Update user failed:', err);
        this.errorMessage = 'Failed to update user';
      }
    });
  }

  cancelUserEdit() {
    this.userEditMode = false;
    this.selectedUser = null;
  }

  // ========== INVENTORY ==========
  
  loadProducts() {
    // Debugging:
    // if (!this.currentUser?._id) {
    //   console.error('Admin currentUser missing _id:', this.currentUser);
    //   this.errorMessage = 'Admin userId missing';
    //   return;
    // }

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
  }

  // ========== ANALYTICS ==========
  
  calculateAnalytics() {
    if (this.orders.length === 0) {
      this.loadOrders();
      return;
    }
    
    // Calculate stats
    const paidOrders = this.orders.filter(o => o.orderStatus === 'paid' || o.paymentDetails?.paymentStatus === 'Approved');
    
    this.salesStats.totalOrders = paidOrders.length;
    this.salesStats.totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    this.salesStats.avgOrderValue = paidOrders.length > 0 ? this.salesStats.totalRevenue / paidOrders.length : 0;
    
    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    this.salesStats.recentOrders = paidOrders.filter(o => new Date(o.createdAt) > sevenDaysAgo).length;
    
    // Top product
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
    // Simple CSV export
    const paidOrders = this.orders.filter(o => o.orderStatus === 'paid');
    
    let csv = 'Order ID,Date,Customer,Total,Status\n';
    paidOrders.forEach(order => {
      csv += `${order._id},${new Date(order.createdAt).toLocaleDateString()},${order.userEmail},$${order.totalAmount},${order.orderStatus}\n`;
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