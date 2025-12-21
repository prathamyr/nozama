// order-confirmation.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../shared/services/order.service';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order.html'
})
export class Order implements OnInit {
  order: any = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Clear cart state so navbar shows empty cart
    this.cartService.clearCart();
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (!orderId) {
      this.router.navigate(['/home']);
      return;
    }
    this.loadOrder(orderId);
  }

  loadOrder(orderId: string) {
    this.orderService.getOrder(orderId).subscribe({
      next: (response) => {
        if (response?.ok) {
          this.order = response.order;
        } else {
          this.errorMessage = 'Order not found';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load order failed:', err);
        this.errorMessage = 'Failed to load order details';
        this.isLoading = false;
      }
    });
  }
}