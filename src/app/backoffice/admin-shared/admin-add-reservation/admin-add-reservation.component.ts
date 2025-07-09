import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // for date picker functionality
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Reservation } from '../../../models/reservation.model';
import { AdminReservationsService } from '../../admin-services/admin-reservations.service';
import { Product } from '../../../models/product.model';
import { AdminProductService } from '../../admin-services/admin-product.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';  // Import Snackbar
import { ReservedDatesService } from '../../../services/reserved-dates.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-add-reservation',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatCheckboxModule, 
    MatButtonModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    ReactiveFormsModule
  ],
  templateUrl: './admin-add-reservation.component.html',
  styleUrl: './admin-add-reservation.component.css'
})
export class AdminAddReservationComponent {
  @Output() reservationAdded = new EventEmitter<void>();
  
  popupOpen: boolean = false;
  products: Product[] = [];
  reservation: Reservation = {
    status: 'pending', // pending, active, canceled, or fufilled
    reservationId: '', // generate random number
    name: '',
    dates: [],
    pickupNotes: '',
    items: [],
    email: '',
    phoneNumber: '',
    customerNotes: '',
    price: -1,
    deposit: -1,
    reservedOn: null,
    invoiceStatus: '',
    paymentStatus: '',
    depositStatus: '',
    myNotes: '',
  }
  unavaliableItems: Product[] = []; // This will hold the products that are not available for reservation
  selectedProducts: Set<string> = new Set(); // Track selected products
  
  constructor(
    private adminProductService: AdminProductService, 
    private adminReservationService: AdminReservationsService,
    private reservedDatesService: ReservedDatesService, // Assuming this service fetches reserved products by date
    private snackBar: MatSnackBar){}
    

  ngOnInit() {    
    this.adminProductService.getAdminProducts().subscribe(products => {
      this.products = products;
    });
  }

  openReservationCreator(){
    this.popupOpen = true;
    // Don't fetch unavailable items here - wait for dates to be selected
  }

  closeReservationCreator() {
    this.popupOpen = false;
  }

  areDatesSelected(): boolean {
    return this.reservation.dates && this.reservation.dates.length >= 2 && 
           !!this.reservation.dates[0] && !!this.reservation.dates[1];
  }

  onDateChange(): void {
    // Clear previously selected products when dates change
    this.selectedProducts.clear();
    this.reservation.items = [];
    
    // Fetch unavailable items when both dates are selected
    if (this.areDatesSelected()) {
      this.getUnavaliableItems();
    } else {
      this.unavaliableItems = [];
    }
  }

  isProductAvailable(productId: string): boolean {
    // Only check if the product is unavailable due to other reservations
    // Don't disable products that are already selected in this reservation
    const isUnavailable = this.unavaliableItems.some(item => item.productId === productId);
    
    if (isUnavailable) {
      console.log(`Product ${productId} is unavailable`);
      return false;
    }
    
    // Allow products that are already in this reservation to remain enabled for deselection
    return true;
  }

  getUnavaliableItems(): void {
    // Only fetch if dates are selected
    if (!this.areDatesSelected()) {
      this.unavaliableItems = [];
      console.log('No dates selected, clearing unavailable items');
      return;
    }

    console.log('Fetching unavailable items for dates:', this.reservation.dates);

    // Fetch unavailable items based on all the reserved dates
    // Create an array of observables for each date
    const dateChecks = this.reservation.dates.map(date => {
      console.log('Calling API for date:', date, 'ISO string:', date.toISOString());
      return this.reservedDatesService.getReservedProductsByDate(date);
    });

    // Execute all checks and wait for all to complete
    forkJoin(dateChecks).subscribe({
      next: (results) => {
        console.log('API results for date checks:', results);
        
        // Flatten all product ID arrays and get unique values
        const allUnavailableIds = results.flat();
        const uniqueUnavailableIds = [...new Set(allUnavailableIds)];
        
        console.log('Unavailable product IDs:', uniqueUnavailableIds);
        
        // Filter products that are unavailable on any of the dates
        this.unavaliableItems = this.products.filter(product => 
          uniqueUnavailableIds.includes(product.productId)
        );
        
        console.log('Unavailable products:', this.unavaliableItems.map(p => p.name));
      },
      error: (error) => {
        console.error('Error fetching unavailable items:', error);
        this.unavaliableItems = []; // Fallback to empty array
      }
    });
  }

  // Check if a product is selected
  isProductSelected(productId: string): boolean {
    return this.selectedProducts.has(productId);
  }

  // Toggle product selection
  toggleProductSelection(product: Product, isChecked: boolean): void {
    console.log('Toggle product selection:', product.name, 'isChecked:', isChecked);
    
    if (isChecked) {
      this.selectedProducts.add(product.productId);
      // Add to reservation items
      this.addProductToReservation(product);
      console.log('Added product:', product.name);
    } else {
      this.selectedProducts.delete(product.productId);
      // Remove from reservation items
      this.removeProductFromReservation(product.productId);
      console.log('Removed product:', product.name);
    }
    
    console.log('Selected products:', Array.from(this.selectedProducts));
    console.log('Reservation items:', this.reservation.items.map(item => item.name));
  }

  // Add product to reservation
  addProductToReservation(product: Product): void {
    // Check if product is already in the reservation
    if (!this.reservation.items.some(item => item.productId === product.productId)) {
      this.reservation.items.push({
        productId: product.productId,
        quantity: 1,
        name: product.name,
        price: product.price,
        deposit: product.deposit,
        description: product.description
      });
    }
  }

  // Remove product from reservation
  removeProductFromReservation(productId: string): void {
    this.reservation.items = this.reservation.items.filter(item => item.productId !== productId);
  }

  submitReservation() {

    const { dates } = this.reservation;

    // store in format YYYY-MM-DD
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      this.reservation.dates = this.getDateRange(start, end);
      
      console.log('dates:', this.reservation.dates);
    }

    // Note: reservation.items is already populated by the checkbox toggle methods
    // No need to filter here since items are added/removed in real-time
  
    // If price and deposit are -1, calculate based on the product inserted
    if (this.reservation.price === -1){
      this.reservation.price = this.calculatePrice();
    }
    if (this.reservation.deposit === -1) {
      this.reservation.deposit = this.calculateDeposit();
    }

    // Get today’s date
    this.reservation.reservedOn = new Date();
  
    // Set default statuses
    this.reservation.invoiceStatus = 'not sent';
    this.reservation.paymentStatus = 'not paid';
    this.reservation.depositStatus = 'not returned';
  
    // Logic to handle reservation submission, e.g., save data to backend or S3
    console.log('Reservation details:', this.reservation);

    this.adminReservationService.addReservation(this.reservation).subscribe(
      (response: Reservation) => { // Specify the response type
        console.log('Reservation added successfully:', response);
        
        // Emit event to notify parent component
        this.reservationAdded.emit();
        
        // Close the popup and reset form
        this.closeReservationCreator();
        this.setDefaults();
      },
      (error: any) => {
        console.error('Error adding reservation:', error);
        this.displayError(error);
      }
    );

  }

  // Helper function to generate the date range
  getDateRange(start: Date, end: Date): Date[] {
    const dateArray: Date[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dateArray.push(new Date(currentDate)); // Add a copy of the current date
      currentDate.setDate(currentDate.getDate() + 1); // Increment the day
    }

    return dateArray;
  }

  calculatePrice() : number {
    let totalPrice = 0;
    // for each item in items[], get the price and add it up
    this.reservation.items.forEach(item => {
      totalPrice += item.price; // Assuming each item has a `price` property
    });
  
    // Update the reservation price with the calculated total
    return totalPrice;
    return 1;
  }

  calculateDeposit() : number {
    let totalDeposit = 0;
    // for each item in items[], get the price and add it up
    this.reservation.items.forEach(item => {
      totalDeposit += item.price; // Assuming each item has a `price` property
    });
  
    // Update the reservation price with the calculated total
    return totalDeposit;
    return 1;
  }

  setDefaults() {
    this.reservation.price = -1;
    this.reservation.deposit = -1;
    this.reservation.dates = [];
    this.reservation.items = [];
    this.selectedProducts.clear(); // Clear selected products
  }

  displayError(error: any): void {
    let errorMessage = 'An error occurred while processing your reservation.';

    // Customize the error message based on the error response if available
    if (error && error.message) {
      errorMessage = error.message;
    }

    // Display the error message using Snackbar
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,  // The snackbar will automatically close after 5 seconds
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }
}
