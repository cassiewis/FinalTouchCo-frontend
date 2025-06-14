import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CartService } from '../services/cart-service.service';

@Injectable({
  providedIn: 'root'
})
export class CartNotEmptyGuard implements CanActivate {
  constructor(private cartService: CartService, private router: Router) {}

  canActivate(): boolean {
    const cartItems = this.cartService.getItems();
    if (cartItems.length > 0) {
      return true;
    } else {
      this.router.navigate(['/cart']); // redirect to cart if empty
      return false;
    }
  }
}
