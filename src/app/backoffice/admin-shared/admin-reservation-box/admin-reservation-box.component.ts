import { Component, Input } from '@angular/core';
import { Reservation, ReservedItem } from '../../../models/reservation.model';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AdminReservationsService } from '../../admin-services/admin-reservations.service';
import { PAYMENT_DUE_DAYS, SEND_INVOICE_DAYS } from '../../../shared/constants';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../../models/product.model';
import { AdminProductService } from '../../admin-product.service';
import { ReservedDatesService } from '../../../services/reserved-dates.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-reservation-box',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-reservation-box.component.html',
  styleUrl: './admin-reservation-box.component.css'
})
export class AdminReservationBoxComponent {
@Input() reservation!: Reservation;
  expandBox: boolean = false;
  editMode: boolean = false;
  showStatusDropdown: boolean = false;
  showAddProducts: boolean = false; // Track if Add Products section is expanded
  editableReservation!: Reservation; // Editable copy of reservation
  allProducts: Product[] = []; // Holds all products for adding to reservation
  unavaliableItems: Product[] = []; // Track unavailable products
  showInvoiceDropdown = false;
  showPaymentDropdown = false;

  newStartDate: Date | null = null;
  newEndDate: Date | null = null;

  // Expose the constant for template use
  readonly PAYMENT_DUE_DAYS = PAYMENT_DUE_DAYS;
  readonly SEND_INVOICE_DAYS = SEND_INVOICE_DAYS;
  
  datesForm: FormGroup = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  constructor(
    private adminReservationService: AdminReservationsService,
    private adminProductService: AdminProductService,
    private reservedDatesService: ReservedDatesService
  ){}

  ngOnInit() {
    this.editableReservation = { ...this.reservation };
    this.reservation.dates = this.reservation.dates.map(dateStr => new Date(dateStr));
    
    this.datesForm.setValue({
      start: this.editableReservation.dates[0],
      end: this.editableReservation.dates[this.editableReservation.dates.length - 1]
    });

    this.adminProductService.getAdminProducts().subscribe(products => {
      this.allProducts = products;
    });
  }

  public toggleExpandedBox(): void {
    this.expandBox = !this.expandBox;
  }

  closeExpandedBox(): void {
    this.expandBox = false;
  }

  openEditMode() {
    this.adminReservationService.getAdminReservation(this.reservation.reservationId).subscribe(
      (cachedReservation) => {
        if (cachedReservation) {
          this.editableReservation = { ...cachedReservation };
          this.editMode = true;
          this.datesForm.setValue({
            start: this.editableReservation.dates[0],
            end: this.editableReservation.dates[this.editableReservation.dates.length - 1]
          });
        }
      }
    );
  }

  toggleAddProducts(): void {
    this.showAddProducts = !this.showAddProducts;
    
    // Only fetch unavailable items when opening the section
    if (this.showAddProducts && this.unavaliableItems.length === 0) {
      this.getUnavaliableItems();
    }
  }

  isProductAvailable(productId: string): boolean {
    // if the productid is in the unavaliableItems array or if already in the reservation, return false
    if (this.unavaliableItems.some(item => item.productId === productId)) {
      return false;
    }
    if (this.reservation.items.some(item => item.productId === productId)) {
      return false;
    }
    // Check if the product is reserved on any of the reservation dates
    return true;
  }

  getUnavaliableItems(): void {
    // Fetch unavailable items based on all the reserved dates
    // Create an array of observables for each date
    const dateChecks = this.reservation.dates.map(date => 
      this.reservedDatesService.getReservedProductsByDate(date)
    );

    // Execute all checks and wait for all to complete
    forkJoin(dateChecks).subscribe(results => {
      // Flatten all product ID arrays and get unique values
      const allUnavailableIds = results.flat();
      const uniqueUnavailableIds = [...new Set(allUnavailableIds)];
      
      // Filter products that are unavailable on any of the dates
      this.unavaliableItems = this.allProducts.filter(product => 
        uniqueUnavailableIds.includes(product.productId)
      );
    });
  }

  addProductToReservation(product: Product): void {

      this.editableReservation.items.push({
        productId: product.productId,
        quantity: 1,
        name: product.name,
        price: product.price,
        deposit: product.deposit,
        description: product.description,
        imageUrl: product.imageUrl
      });

      this.editableReservation.price = this.editableReservation.price + product.price;
  }

  removeProductFromReservation(reservedItem: ReservedItem): void {
    // warn first
    if (!confirm(`Are you sure you want to remove ${reservedItem.name} from the reservation?`)) {
      return; // Exit if user cancels
    }
    // Find the index of the product in the reservation items
    const index = this.editableReservation.items.findIndex(item => item.productId === reservedItem.productId);
    
    // If found, remove it from the items array
    if (index !== -1) {
      this.editableReservation.items.splice(index, 1);
      this.editableReservation.price -= reservedItem.price; // Adjust the total price
    }
  } 


  saveReservation(): void {
    // Update dates if they were edited in the form
    const formDates = this.datesForm.value;
    if (formDates.start && formDates.end) {
      console.log('Form Dates:', formDates);
      const startDate = new Date(formDates.start);
      const endDate = new Date(formDates.end);
      const dates: Date[] = [];

      // Generate all dates between startDate and endDate as ISO strings
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d)); // Push ISO date string (YYYY-MM-DD)
      }
      console.log('Generated Dates:', dates);
      this.editableReservation.dates = dates; // Update editableReservation with new dates
    }

    // Copy edited values back to the original reservation
    this.reservation = { ...this.editableReservation };

    this.adminReservationService.updateReservation(this.reservation).subscribe(
      (response: Reservation) => { // Specify the response type
        console.log('Reservation updated successfully:', response);
      },
      (error: any) => { // Specify the error type as any
        console.error('Error updated reservation:', error);
        // error handling logic
      }
    );

    this.editMode = false; // Exit edit mode
    // window.location.reload(); // reload the page so reservations update
  }

  closeReservationEditor(): void {
    // Discard any changes and reset the editable reservation
    this.editableReservation = { ...this.reservation };

    // Reset the form to the original dates
    this.datesForm.setValue({
      start: this.reservation.dates[0],
      end: this.reservation.dates[this.reservation.dates.length - 1]
    });

    this.editMode = false; // Exit edit mode
  }

  displayDates(): string {
    if (this.reservation.dates) {
      const startDate = new Date(this.reservation.dates[0]);
      const endDate = new Date(this.reservation.dates[this.reservation.dates.length-1]);
      const year = startDate.getFullYear();

      // Format each date to only show month (short name) and day
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const startFormatted = startDate.toLocaleDateString('en-US', options);
      const endFormatted = endDate.getDate(); // Only show the day for the end date

      return `${startFormatted}-${endFormatted}, ${year}`;
    }
    return 'No dates';
  }

  displayDate(date: Date) : string {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateFormatted = date.toLocaleDateString('en-US', options);

    return `${dateFormatted}`;
  }

  displayDateFrom(date: Date, days: number) : string {
    if (date) {
      // Create a new Date instance based on the input date to avoid modifying the original date
      const calculatedDate = new Date(date.getTime());
      
      // Adjust the date by the specified number of days
      calculatedDate.setDate(calculatedDate.getDate() - days);
  
      // Format the result to display as desired
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      return calculatedDate.toLocaleDateString('en-US', options);
    }
    return "No date";
  }

  calculateTotalPrice() : number {
    return this.reservation.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  displayTotalPrice() : number {
    return this.reservation.items.reduce((total, item) => total + item.price, 0);
  }

  displayTotalDeposit() : number {
    return this.reservation.items.reduce((total, item) => total + item.deposit, 0);
  }

  toggleStatusDropdown(event: Event): void {
    event.stopPropagation(); // Prevent the click from triggering the expanded box
    this.showStatusDropdown = !this.showStatusDropdown;
  }

  closeStatusDropdown() {
    this.showStatusDropdown = false;
  }

  onDocumentClick(event: Event): void {
    // Close all dropdowns when clicking outside
    this.showStatusDropdown = false;
    this.showInvoiceDropdown = false;
    this.showPaymentDropdown = false;
  }

  updateReservationStatus(newStatus: string): void {
    // update reservation status ONLY if status changes
    if (this.reservation.status === newStatus) {
      this.showStatusDropdown = false; // Close the dropdown
      return;
    }
    // if changing to canceled, confirm with user
    if (!confirm(`Are you sure you want to change reservation status to ${newStatus}?`)) {
      this.showStatusDropdown = false; // Close the dropdown
      return;
    }
    // Call the service to update the reservation status
    this.adminReservationService.updateReservationStatus(this.reservation.reservationId, newStatus)
      .subscribe({
        next: () => {
          this.reservation.status = newStatus; // Update the status locally
          this.showStatusDropdown = false; // Close the dropdown
          // todo update cache 
        },
        error: (err) => {
          console.error('Error updating reservation status:', err);
        }
      });
  }

  isStatusLate(reservationDay: Date, days: number): boolean {
    // display if the current date is past the date
    const today = new Date();
    const reservationDate = new Date(reservationDay);
    reservationDate.setDate(reservationDate.getDate() - days); // Adjust the reservation date
    return today > reservationDate;
  }

  toggleInvoiceDropdown(event: Event): void {
    event.stopPropagation();
    this.showInvoiceDropdown = !this.showInvoiceDropdown;
    this.showStatusDropdown = false;
    this.showPaymentDropdown = false;
  }

  togglePaymentDropdown(event: Event): void {
    event.stopPropagation();
    this.showPaymentDropdown = !this.showPaymentDropdown;
    this.showStatusDropdown = false;
    this.showInvoiceDropdown = false;
  }

  updatePaymentStatus(status: string): void {
    if (this.reservation.paymentStatus === status) {
      this.showPaymentDropdown = false; // Close the dropdown
      return; // No change needed
    }
    this.editableReservation.paymentStatus = status;
    this.adminReservationService.updateReservation(this.editableReservation)
      .subscribe({
        next: (response: Reservation) => {
          console.log('Payment status updated successfully:', response);
          this.reservation.paymentStatus = status; // Update the original reservation
        },
        error: (error: any) => {
          console.error('Error updating payment status:', error);
        }
      });
      this.showPaymentDropdown = false;
  }

  updateInvoiceStatus(status: string): void {
    if (this.reservation.invoiceStatus === status) {
      this.showInvoiceDropdown = false; // Close the dropdown
      return; // No change needed
    }
    this.editableReservation.invoiceStatus = status;
    this.adminReservationService.updateReservation(this.editableReservation)
      .subscribe({
        next: (response: Reservation) => {
          console.log('Invoice status updated successfully:', response);
          this.reservation.invoiceStatus = status; // Update the original reservation
        },
        error: (error: any) => {
          console.error('Error updating invoice status:', error);
        }
      });
      this.showInvoiceDropdown = false;
  }


}
