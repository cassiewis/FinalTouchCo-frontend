// Updated CartService using a Map to group items by reservation
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  deposit: number;
  datesReserved: Date[];
  imageUrl: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private reservationMap: Map<string, CartItem[]> = new Map();
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    this.loadCartItems();
    this.updateCartCount();
  }

  private getReservationKey(dates: Date[]): string {
    const start = new Date(dates[0]).toISOString().split('T')[0];
    const end = new Date(dates[dates.length - 1]).toISOString().split('T')[0];
    return `${start}_to_${end}`;
  }

  getReservationMap(): Map<string, CartItem[]> {
    return this.reservationMap;
  }

  hasMatchingReservationDates(dates: Date[]): boolean {
    const newKey = this.getReservationKey(dates);
    return this.reservationMap.has(newKey);
  }

  addToCart(item: CartItem) {
    const key = this.getReservationKey(item.datesReserved);
    const group = this.reservationMap.get(key) || [];
    group.push(item);
    this.reservationMap.set(key, group);
    this.saveCartItems();
    this.updateCartCount();
  }

  removeFromCart(productId: string) {
    for (const [key, group] of this.reservationMap.entries()) {
      const newGroup = group.filter(item => item.productId !== productId);
      if (newGroup.length > 0) {
        this.reservationMap.set(key, newGroup);
      } else {
        this.reservationMap.delete(key);
      }
    }
    this.saveCartItems();
    this.updateCartCount();
    console.log(`Removed item with productId: ${productId} from cart.`);
  }

  getItems(): CartItem[] {
    return Array.from(this.reservationMap.values()).flat();
  }

  getGroupedItems(): Map<string, CartItem[]> {
    return this.reservationMap;
  }

  getTotalCost(): number {
    return this.getItems().reduce((acc, item) => acc + item.price, 0);
  }

  getTotalDeposit(): number {
    return this.getItems().reduce((acc, item) => acc + item.deposit, 0);
  }

  clearCart() {
    this.reservationMap.clear();
    localStorage.removeItem('cartItemsByReservation');
    this.updateCartCount();
  }

  private updateCartCount() {
    this.cartCountSubject.next(this.getItems().length);
  }

  private saveCartItems() {
    const obj: Record<string, CartItem[]> = {};
    this.reservationMap.forEach((value, key) => obj[key] = value);
    localStorage.setItem('cartItemsByReservation', JSON.stringify(obj));
  }

  private loadCartItems() {
    const raw = localStorage.getItem('cartItemsByReservation');
    if (raw) {
      const obj = JSON.parse(raw);
      this.reservationMap = new Map(Object.entries(obj));
    }
  }

  getReservationCount(): number {
    return this.reservationMap.size;
  }
}
