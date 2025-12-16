import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  // Featured products to display
  featuredProducts: any[] = [];
  
  // Product categories for navigation
  categories = [
    { name: 'Gaming Laptops', icon: '🎮', value: 'gaming' },
    { name: 'Business', icon: '💼', value: 'business' },
    { name: '2-in-1', icon: '📱', value: '2-in-1' },
    { name: 'Ultra Slim', icon: '✨', value: 'ultrabook' }
  ];

  // Dashboard stats
  stats = {
    totalProducts: 0,
    newArrivals: 0,
    onSale: 0
  };

  // Current cart for quick add feedback
  currentCart: any = null;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadStats();
    this.loadCart();
  }

  // Load featured products from API
  loadFeaturedProducts() {
    this.productService.getProducts().subscribe({
      next: (response) => {
        if (response && response.products) {
          // Get first 4 products as featured
          this.featuredProducts = response.products.slice(0, 4);
        }
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        // Use dummy data as fallback
        this.featuredProducts = this.getDummyProducts();
      }
    });
  }

  // Load dashboard statistics
  loadStats() {
    this.productService.getProducts().subscribe({
      next: (response) => {
        if (response && response.products) {
          this.stats.totalProducts = response.products.length;
          // Count new arrivals (products created in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          this.stats.newArrivals = response.products.filter((p: any) => 
            new Date(p.createdAt) > thirtyDaysAgo
          ).length;
          // Count on sale (just placeholder logic)
          this.stats.onSale = Math.floor(response.products.length * 0.3);
        }
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        // Default stats
        this.stats = { totalProducts: 12, newArrivals: 3, onSale: 5 };
      }
    });
  }

  // Load current cart
  loadCart() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user._id : 'guest';
    
    this.cartService.getCart(userId).subscribe({
      next: (response) => {
        if (response && response.cart) {
          this.currentCart = response.cart;
        }
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
      }
    });
  }

  // Navigate to products with category filter
  viewCategory(category: string) {
    this.router.navigate(['/products'], { queryParams: { category } });
  }

  // Navigate to product detail page
  viewProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  // Quick add to cart from home page
  quickAddToCart(product: any) {
    if (!this.currentCart) {
      console.error('Cart not loaded');
      return;
    }
    
    this.cartService.addToCart(this.currentCart._id, product._id, 1).subscribe({
      next: (response) => {
        if (response?.ok) {
          // Cart observable will auto-update navbar badge
          console.log(`Added ${product.name}`);
        }
      },
      error: (err) => console.error('Add failed:', err)
    });
  }

  // Fallback dummy data
  private getDummyProducts() {
    return [
      {
        _id: '1',
        name: 'ThinkPad X1 Carbon',
        price: 1899,
        thumbnailImg: '/laptops/ThinkPad X1 Carbon Gen 13 Intel (14\'\') Aura Edition/fcd70qdguca5etsxhgazpeezkoam7p488088.avif',
        brand: 'Lenovo',
        stockQuantity: 15
      },
      {
        _id: '2',
        name: 'Yoga Slim 7x',
        price: 1299,
        thumbnailImg: '/laptops/Yoga Slim 7x(14\'\' Snapdragon)/lenovo-yoga-slim-7x-copilot.webp',
        brand: 'Lenovo',
        stockQuantity: 20
      },
      {
        _id: '3',
        name: 'LOQ Gaming',
        price: 999,
        thumbnailImg: '/laptops/LOQ (15\'\' AMD) with up to RTX 5060)/loq-15ahp10-gaming-laptop-v1.avif',
        brand: 'Lenovo',
        stockQuantity: 8
      },
      {
        _id: '4',
        name: 'Yoga 7i 2-in-1',
        price: 1499,
        thumbnailImg: '/laptops/Yoga 7i 2-in-1(16 Intel)/lenovo-yoga-7i-2-in-1-16inch.avif',
        brand: 'Lenovo',
        stockQuantity: 12
      }
    ];
  }
}