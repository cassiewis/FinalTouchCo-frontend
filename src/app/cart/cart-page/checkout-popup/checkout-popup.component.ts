import { Component, Input, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../../services/cart-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reservation } from '../../../models/reservation.model';
import { ReservedItem } from '../../../models/reservation.model';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-checkout-popup',
  templateUrl: './checkout-popup.component.html',
  styleUrls: ['./checkout-popup.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class CheckoutPopupComponent implements OnInit {
  @Input() cart: CartItem[] = []; // Allow parent to pass cart items
  showCheckoutPopup: boolean = false;
  isSubmitting: boolean = false;
  isAgreed: boolean = false;
  name: string = '';
  email: string = '';
  phoneNumber: string = '';
  customerNotes: string = '';

  constructor(private cartService: CartService, private reservationService: ReservationService) {}

  ngOnInit() {
    // Fetch cart items from the service if not passed by the parent
    if (!this.cart || this.cart.length === 0) {
      this.cart = this.cartService.getItems();
    }
  }

  showPopup() {
    this.showCheckoutPopup = true;
  }

  closePopup() {
    this.showCheckoutPopup = false;
  }

  /**
   * Create reservations based on cart items grouped by `datesReserved`.
   */
  createReservations(): Reservation[] {
    // Group cart items by datesReserved
    const reservationsMap = this.cart.reduce((groups, item) => {
      const key = JSON.stringify(item.datesReserved); // Use dates as a unique key
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as { [key: string]: CartItem[] });

    // Transform grouped items into Reservation objects
    return Object.keys(reservationsMap).map((dates) => {
      const groupedItems = reservationsMap[dates];

      // Convert CartItems to ReservedItems
      const reservedItems: ReservedItem[] = groupedItems.map((item) => ({
        productId: item.productId,
        count: 1, // Assuming count is always 1 for simplicity
        name: item.name,
        price: item.price,
        deposit: item.deposit,
        description: '', // Include description if available
      }));

      // Calculate total price and deposit
      const totalPrice = reservedItems.reduce((sum, item) => sum + item.price, 0);
      const totalDeposit = reservedItems.reduce((sum, item) => sum + item.deposit, 0);

      return {
        status: 'pending',
        reservationId: '',
        name: this.name, // To be filled in via form
        dates: JSON.parse(dates),
        pickupNotes: '',
        items: reservedItems,
        email: this.email, // To be filled in via form
        phoneNumber: this.phoneNumber, // To be filled in via form
        customerNotes: this.customerNotes, // To be filled in via form
        price: totalPrice,
        deposit: totalDeposit,
        reservedOn: new Date(),
        invoiceStatus: 'not sent',
        paymentStatus: 'not received',
        depositStatus: 'not returned',
        myNotes: '', // Optional admin notes
      } as Reservation;
    });
  }

  /**
   * Confirm the checkout by creating reservations and handling them.
   */
  confirmCheckout() {
    if (this.isSubmitting){ return }; // Prevent multiple clicks
    this.isSubmitting = true;

    const reservations = this.createReservations();
    console.log('Generated Reservations:', reservations);

    let successfulSubmissions = 0; // track reservations

    // Handle submission (e.g., send to backend API)
    for (const single_reservation of reservations) {
      this.reservationService.addReservation(single_reservation).subscribe(
        (response: Reservation) => { // Specify the response type
          console.log('Reservation added successfully:', response);
          successfulSubmissions++;

          // If all reservations are successfully submitted, clear the cart and close the popup
          if (successfulSubmissions === reservations.length) {
            this.cartService.clearCart(); // Clear the cart
            this.closePopup(); // Close the popup
            this.isSubmitting = false; // Reset submission state
            // todo display success 
          }
        },
        (error: any) => {
          console.error('Error adding reservation:', error);
          this.isSubmitting = false; // Allow retry on failure
          // todo this.displayError(error);
        }
      );
    }
  }
}