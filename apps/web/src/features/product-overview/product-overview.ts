import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../shared/services/product.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-product-overview',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-overview.html'
})
export class ProductOverview implements OnInit, OnDestroy {
  product: any = null;
  currentCart: any = null;
  selectedQuantity: number = 1;
  
  private routeSub?: Subscription;
  private cartSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get product ID from route
    this.routeSub = this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });

    // Subscribe to cart updates
    this.cartSub = this.cartService.cart$.subscribe(cart => {
      this.currentCart = cart;
    });

    // Load cart if not present
    this.loadCart();
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }

  // Load product details
  loadProduct(productId: string) {
    this.productService.getProduct(productId).subscribe({
      next: (response) => {
        if (response?.ok && response.product) {
          this.product = response.product;
        }
      },
      error: (err) => {
        console.error('Failed to load product:', err);
        // Redirect back if product not found
        this.router.navigate(['/products']);
      }
    });
  }

  // Load current cart
  loadCart() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user._id : 'guest';
    
    this.cartService.getCart(userId).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.currentCart = response.cart;
        }
      },
      error: (err) => console.error('Cart load failed:', err)
    });
  }

  // Get available quantities (max 10 or stock quantity)
  getAvailableQuantities(): number[] {
    if (!this.product) return [1];
    const max = Math.min(this.product.stockQuantity, 10);
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  // Convert specs Map to array for template
  getSpecsArray(): Array<{ key: string; value: string }> {
    if (!this.product?.specs) return [];
    return Object.entries(this.product.specs).map(([key, value]) => ({
      key,
      value: String(value)
    }));
  }

  // Add to cart
  addToCart() {
    if (!this.currentCart) {
      console.error('Cart not loaded');
      return;
    }

    this.cartService.addToCart(
      this.currentCart._id, 
      this.product._id, 
      this.selectedQuantity
    ).subscribe({
      next: (response) => {
        if (response?.ok) {
          console.log(`Added ${this.selectedQuantity} x ${this.product.name}`);
          // Optionally navigate to cart
          // this.router.navigate(['/cart']);
        }
      },
      error: (err) => console.error('Add to cart failed:', err)
    });
  }

  // Navigate back to products
  goBack() {
    this.router.navigate(['/products']);
  }
}