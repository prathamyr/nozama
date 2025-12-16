import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html'
})

export class Products implements OnInit, OnDestroy {
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  currentCart: any = null;
  
  searchQuery: string = '';
  sortBy: string = '';
  selectedBrands: { [key: string]: boolean } = {};
  selectedPriceRanges: { [key: string]: boolean } = {};
  
  brands: string[] = [];
  priceRanges = [
    { label: 'Under $500', min: 0, max: 500 },
    { label: '$500 - $1000', min: 500, max: 1000 },
    { label: '$1000 - $1500', min: 1000, max: 1500 },
    { label: '$1500 - $2000', min: 1500, max: 2000 },
    { label: 'Over $2000', min: 2000, max: Infinity }
  ];

  private cartSub?: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
  this.loadCart();
  
  // Subscribe to cart updates
  this.cartSub = this.cartService.cart$.subscribe(cart => {
    this.currentCart = cart;
  });

  // Handle category from query params
  this.route.queryParams.subscribe(params => {
    const category = params['category'];
    this.loadProducts(category);
  });
}

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
  }

  // Load products from API
  // Update loadProducts to accept optional category
  loadProducts(category?: string) {
    this.productService.getProducts().subscribe({
      next: (response) => {
        if (response?.ok && response.products) {
          this.allProducts = response.products;
          
          // Apply category filter if present
          if (category) {
            this.filteredProducts = response.products.filter((p: any) => 
              p.category?.toLowerCase() === category.toLowerCase()
            );
          } else {
            this.filteredProducts = response.products;
          }
          
          this.extractBrands();
        }
      },
      error: (err) => console.error('Failed to load products:', err)
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

  // Extract unique brands
  extractBrands() {
  const brandSet = new Set<string>();
  this.allProducts.forEach(p => {
    if (p.brand) {
      brandSet.add(p.brand); // Yet another fix
    }
  });
  this.brands = Array.from(brandSet).sort();
  this.brands.forEach(brand => this.selectedBrands[brand] = false);
  }

  // Apply filters
  applyFilters() {
    let results = [...this.allProducts];

    // Search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Brand filter
    const selectedBrandsList = Object.keys(this.selectedBrands).filter(b => this.selectedBrands[b]);
    if (selectedBrandsList.length > 0) {
      results = results.filter(p => selectedBrandsList.includes(p.brand));
    }

    // Price range filter
    const selectedRanges = Object.keys(this.selectedPriceRanges).filter(r => this.selectedPriceRanges[r]);
    if (selectedRanges.length > 0) {
      results = results.filter(p => {
        return selectedRanges.some(rangeLabel => {
          const range = this.priceRanges.find(r => r.label === rangeLabel);
          return range && p.price >= range.min && p.price < range.max;
        });
      });
    }

    // Sort
    if (this.sortBy) {
      results = this.sortProducts(results, this.sortBy);
    }

    this.filteredProducts = results;
  }

  // Sort helper
  sortProducts(products: any[], sortBy: string): any[] {
    const sorted = [...products];
    switch(sortBy) {
      case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc': return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
      default: return sorted;
    }
  }

  clearFilters() {
    this.searchQuery = '';
    this.sortBy = '';
    Object.keys(this.selectedBrands).forEach(b => this.selectedBrands[b] = false);
    Object.keys(this.selectedPriceRanges).forEach(r => this.selectedPriceRanges[r] = false);
    this.applyFilters();
  }

  viewProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  // Add to cart via CartService
  addToCart(product: any) {
    if (!this.currentCart) {
      console.error('Cart not loaded');
      return;
    }
    
    this.cartService.addToCart(this.currentCart._id, product._id, 1).subscribe({
      next: (response) => {
        if (response?.ok) {
          console.log(`Added ${product.name}`);
        }
      },
      error: (err) => console.error('Add to cart failed:', err)
    });
  }
}