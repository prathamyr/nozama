import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ProductService } from '../../shared/services/product.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../environments/environment';

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

  // Precomputed data for template (always initialized)
  galleryImages: any[] = [];
  availableQuantities: number[] = [1];
  specsArray: { key: string; value: string }[] = [];
  activeImageUrl: string = '';
  
  // Wishlist state
  isInWishlist: boolean = false;
  isAddingToWishlist: boolean = false;
  
  private routeSub?: Subscription;
  private cartSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get product ID from route params
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

  // Build view model from product data
  private buildViewModel(product: any) {
    // Get up to 6 gallery images (safely handle undefined)
    this.galleryImages = Array.isArray(product?.imageGallery) 
      ? product.imageGallery.slice(0, 6) 
      : [];
    
    // Set active image (first gallery image or thumbnail)
    this.activeImageUrl =
      this.galleryImages[0]?.url ||
      product?.thumbnailImg ||
      '';

    // Calculate available quantities (max 10 or stock level)
    const stock = Number(product?.stockQuantity || 0);
    const max = Math.min(stock, 10);
    this.availableQuantities = max > 0 ? Array.from({length: max}, (_, i) => i + 1) : [1];

    // Convert specs object to array for template iteration
    const specs = product?.specs || {};
    this.specsArray = Object.entries(specs).map(([key, value]) => ({
      key,
      value: String(value)
    }));
  }

  // Set the active image in the gallery
  setActiveImage(url: string) {
    this.activeImageUrl = url;
  }

  // Load product details by ID
  loadProduct(productId: string) {
    this.productService.getProduct(productId).subscribe({
      next: (response) => {
        if (response?.ok && response.product) {
          // Defer assignment to avoid NG0100 ExpressionChangedAfterItHasBeenCheckedError
          queueMicrotask(() => {
            this.product = response.product;
            this.buildViewModel(this.product);
            this.checkWishlistStatus();
            this.cdr.markForCheck();
          });
        }
      },
      error: (err) => {
        console.error('Failed to load product:', err);
        this.router.navigate(['/products']);
      }
    });
  }

  // Load current user's cart
  loadCart() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user._id : 'guest';

    this.cartService.getCart(userId).subscribe({
      next: (response) => {
        if (response?.ok) this.currentCart = response.cart;
      },
      error: (err) => console.error('Cart load failed:', err)
    });
  }

  // Add product to cart with selected quantity
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
          // Optional: navigate to cart page
          // this.router.navigate(['/cart']);
        }
      },
      error: (err) => console.error('Add to cart failed:', err)
    });
  }

  // Navigate back to products list
  goBack() {
    this.router.navigate(['/products']);
  }

  // Check if product is in user's wishlist
  checkWishlistStatus() {
    const user = this.authService.getCurrentUser();
    if (!user || !this.product) {
      this.isInWishlist = false;
      return;
    }

    this.http.get(`${environment.serverUrl}/users/${user._id}`, {
      headers: { 'x-user-id': user._id }
    }).subscribe({
      next: (response: any) => {
        if (response?.ok && response.user?.wishlist) {
          // Check if product ID is in wishlist array
          this.isInWishlist = response.user.wishlist.some((item: any) => 
            (item._id || item) === this.product._id
          );
        }
      },
      error: (err) => console.error('Failed to check wishlist:', err)
    });
  }

  // Toggle product in wishlist (add or remove)
  toggleWishlist() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.log('Please login to add items to wishlist');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.product) return;

    this.isAddingToWishlist = true;

    if (this.isInWishlist) {
      // Remove from wishlist
      this.http.delete(
        `${environment.serverUrl}/users/${user._id}/wishlist/${this.product._id}`,
        { headers: { 'x-user-id': user._id } }
      ).subscribe({
        next: (response: any) => {
          if (response?.ok) {
            this.isInWishlist = false;
            console.log('Removed from wishlist');
          }
          this.isAddingToWishlist = false;
        },
        error: (err) => {
          console.error('Failed to remove from wishlist:', err);
          this.isAddingToWishlist = false;
        }
      });
    } else {
      // Add to wishlist
      this.http.post(
        `${environment.serverUrl}/users/${user._id}/wishlist`,
        { productId: this.product._id },
        { headers: { 'x-user-id': user._id } }
      ).subscribe({
        next: (response: any) => {
          if (response?.ok) {
            this.isInWishlist = true;
            console.log('Added to wishlist');
          }
          this.isAddingToWishlist = false;
        },
        error: (err) => {
          console.error('Failed to add to wishlist:', err);
          this.isAddingToWishlist = false;
        }
      });
    }
  }
}