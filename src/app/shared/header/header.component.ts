import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CartService } from '../../services/cart-service.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  cartCount: number = 0;
  private cartCountSubscription!: Subscription; // Use non-null assertion

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Subscribe to the cart count observable
    this.cartCountSubscription = this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count; // Update cartCount whenever it changes
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.cartCountSubscription.unsubscribe();
  }
}
