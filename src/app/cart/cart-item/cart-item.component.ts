import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CartItem } from '../../services/cart-service.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart-service.service';
import { CartComponent } from '../cart-page/cart-page.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { BUFFER_DAYS } from '../../shared/constants';
import { ReservedDatesService } from '../../services/reserved-dates.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, CartComponent],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css'
})
export class CartItemComponent implements OnInit {
  @Input() item!: CartItem; // Accept product data as input
  hasDateErrors: boolean;
  currentProduct!: Product;
  reservedDates: Date[] = [];
  
  @Output("updateCart") updateCart: EventEmitter<any> = new EventEmitter(); // EventEmitter to notify CartComponent

  constructor(
    private router: Router, 
    private cartService: CartService, 
    private productService: ProductService,
    private reservedDatesService: ReservedDatesService
  ){
    this.hasDateErrors = false;
  }

  ngOnInit() {
   // Subscribe to the observable
    this.productService.getProduct(this.item.productId).subscribe(
          (product: Product) => {
            this.currentProduct = product;
          },
          error => console.error('Error fetching product:', error)
        );
  }

  routeToProduct() {
    this.router.navigate(['/product/' + this.item.productId]);
  }

  checkValidDates(bufferDates: number) {
    this.productService.getProduct(this.item.productId).subscribe(
      (product: Product) => {
        this.currentProduct = product;
        this.hasDateErrors = false;

        this.reservedDatesService.getReservedDatesByProductId(product.productId).subscribe(
          (data: Date[]) => {
            this.reservedDates = data;
          },
          (error) => {
            console.error('Error fetching reserved dates:', error);
          }
        );

        for (const dateReserved of this.reservedDates) {
          const isDateRestricted = this.reservedDates.some(reservedDate => {
            const reservedTimestamp = new Date(reservedDate).getTime();
            const dateReservedTimestamp = new Date(dateReserved).getTime();

            return (
              dateReservedTimestamp >= reservedTimestamp - bufferDates * 24 * 60 * 60 * 1000 &&
              dateReservedTimestamp <= reservedTimestamp + bufferDates * 24 * 60 * 60 * 1000
            );
          });

          if (isDateRestricted) {
            setTimeout(() => {
              this.hasDateErrors = true;
              console.log(`Date ${dateReserved} is within the restricted range for product ${this.item.productId}`);
            });
            break;
          } else {
            console.log(`Date ${dateReserved} is available for product ${this.item.productId}`);
          }
        }
      },
      error => {
        console.log(`Product not found for item with ID: ${this.item.productId}`);
        // todo remove from cart
        this.cartService.removeFromCart(this.item.productId);
      }
    );
  }
        
  formatDateRange(datesReserved: Date[]): string {
    if (datesReserved.length === 0) {
      console.log("No dates reserved for cart item");
      return 'No dates reserved';
    }  
    const startDate = new Date(datesReserved[0]).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
    const endDate = new Date(datesReserved[datesReserved.length - 1]).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
    return `${startDate} - ${endDate}`;
  }

  removeItem() {
    this.cartService.removeFromCart(this.item.productId);
    this.updateCart.emit('something');
  }
}

