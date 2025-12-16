import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],  // Added RouterLinkActive
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  user: any = null;
  isVisible: boolean = true;
  cartItemCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {
    // Hide navbar on specific routes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkVisibility(event.url);
    });
  }

  ngOnInit() {
    this.loadUser();
    this.loadCartCount();
    this.checkVisibility(this.router.url);

    // Subscribe to cart changes
    this.cartService.cart$.subscribe(cart => {
      if (cart && cart.items) {
        this.cartItemCount = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      } else {
        this.cartItemCount = 0;
      }
    });
  }

  goToCart() {
  this.router.navigate(['/cart']);
}

  goToHome() {
  this.router.navigate(['/home']);
  }

  // Check if navbar should be visible
  private checkVisibility(url: string) {
    const path = url.split('?')[0];
    const hiddenRoutes = ['/', ''];
    this.isVisible = !hiddenRoutes.includes(path);
  }

  // Load current user
  loadUser() {
    this.user = this.authService.getCurrentUser();
  }

  // Load cart count
  loadCartCount() {
    const userId = this.user ? this.user._id : 'guest';
    this.cartService.getCart(userId).subscribe({
      next: (response) => {
        if (response && response.cart && response.cart.items) {
          this.cartItemCount = response.cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        }
      },
      error: (err) => {
        console.error('Failed to load cart count:', err);
      }
    });
  }

  // Logout user
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearCurrentUser();
        this.cartService.clearCart();
        this.user = null;
        this.cartItemCount = 0;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        // Clear locally even if API fails
        this.authService.clearCurrentUser();
        this.cartService.clearCart();
        this.user = null;
        this.cartItemCount = 0;
        this.router.navigate(['/']);
      }
    });
  }
}