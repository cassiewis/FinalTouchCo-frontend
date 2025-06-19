import { Component, ViewChild, ViewChildren, QueryList, OnInit, ElementRef } from '@angular/core';
import { CartService, CartItem } from '../../services/cart-service.service';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartItemComponent } from '../cart-item/cart-item.component';
import { ReservationService } from '../../services/reservation.service';
import { CheckoutComponent } from '../checkout/checkout.component';
import { BUFFER_DAYS, MINIMUM_ORDER } from '../../shared/constants';
@Component({
  selector: 'app-cart',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, CartItemComponent, CheckoutComponent]
})
export class CartComponent implements OnInit {
   @ViewChild('sectionRef') sectionRef!: ElementRef;
  cartItems: CartItem[] = [];
  groupedItems: Map<string, CartItem[]> = new Map();
  totalCost: number = 0;
  totalDeposit: number = 0;
  MINIMUM_ORDER = MINIMUM_ORDER;

  @ViewChildren(CartItemComponent) cartItemComponents!: QueryList<CartItemComponent>;

  constructor(
    private cartService: CartService, 
    private router: Router, 
    private productService: ProductService, 
    private reservationService: ReservationService,
  ) {
    this.refreshCart();
  }

  ngOnInit(): void {
    console.log('Cart items:', this.cartItems);
  }

  ngAfterViewInit(): void {
    this.checkValidDatesForItems();
  }

  public updateCart() {
    this.refreshCart();
  }

  refreshCart() {
    this.cartItems = this.cartService.getItems();
    this.totalCost = this.cartService.getTotalCost();
    this.totalDeposit = this.cartService.getTotalDeposit();
    this.groupItemsByReservation();
    this.groupedItems = this.cartService.getReservationMap();
  }

  private generateGroupKey(dates: Date[]): string {
    return dates
      .map(d => {
        const date = new Date(d);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // local YYYY-M-D
      })
      .join(',');
  }

  private groupItemsByReservation(): void {
    const groups = new Map<string, CartItem[]>();

    for (const item of this.cartItems) {
      const key = this.generateGroupKey(item.datesReserved);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    this.groupedItems = groups;
  }

  getGroupedKeys(): string[] {
    return Array.from(this.groupedItems.keys());
  }

  formatDateRange(dateString: string): string {
    const parts = dateString.split(',');
    const start = new Date(parts[0]);
    const end = new Date(parts[parts.length - 1]);

    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }

  public formatDateRangeFromItems(items: CartItem[]): string {
    if (!items || items.length === 0) return '';
    const dates = items[0].datesReserved;
    if (!dates || dates.length === 0) return '';
    const start = new Date(dates[0]);
    const end = new Date(dates[dates.length - 1]);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }

  calculateGroupTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price, 0);
  }

  calculateGroupDeposit(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.deposit, 0);
  }

  calculateTax(items: CartItem[]): number {
    const subtotal = this.calculateGroupTotal(items);
    const taxRate = 0.06; // Idaho sales tax
    return subtotal * taxRate;
  }

  goShop() {
    this.router.navigate(['/shop']);
  }

  checkValidDatesForItems() {
    this.cartItemComponents.forEach(itemComponent => {
      itemComponent.checkValidDates(BUFFER_DAYS);
    });
  }

  scrollToCheckout() {
    if (this.sectionRef?.nativeElement) {
      this.sectionRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn('Scroll target not found');
    }
  }

  isBelowMinimum(items: CartItem[]): boolean {
    return this.calculateGroupTotal(items) < MINIMUM_ORDER;
  }

}
