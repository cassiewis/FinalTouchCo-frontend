import { Component } from '@angular/core';
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
import { ProductService } from '../../../services/product.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';  // Import Snackbar

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
  popupOpen: boolean = false;
  products: Product[] = [];
  selectedItems: { [key: string]: boolean } = {}; // Initialize as empty object
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
  
  constructor(
    private productService: ProductService, 
    private adminReservationService: AdminReservationsService,
    private snackBar: MatSnackBar){}
    

  ngOnInit() {    
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  openReservationCreator(){
    this.popupOpen = true;
  }

  closeReservationCreator() {
    this.popupOpen = false;
  }

  submitReservation() {

    const { dates } = this.reservation;

    // store in format YYYY-MM-DD
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      this.reservation.dates = this.getDateRange(start, end);
      
      console.log('dates:', this.reservation.dates);
    }

    this.reservation.items = this.products.filter(product => this.selectedItems[product.productId]); // Filter selected products
  
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
    this.reservation.paymentStatus = 'not received';
    this.reservation.depositStatus = 'not returned';
  
    // Logic to handle reservation submission, e.g., save data to backend or S3
    console.log('Reservation details:', this.reservation);

    this.adminReservationService.addReservation(this.reservation).subscribe(
      (response: Reservation) => { // Specify the response type
        console.log('Reservation added successfully:', response);
      },
      (error: any) => {
        console.error('Error adding reservation:', error);
        this.displayError(error);
      }
    );

    this.closeReservationCreator();
    console.log("Should have closed.")

    // default values
    this.setDefaults();

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
