import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { Product } from '../../../models/product.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../../../shared/custom-snackbar/custom-snackbar.component';
import { ReservedDatesService } from '../../../services/reserved-dates.service';
import { ConfirmNewReservationDialogComponent } from '../../../shared/confirm-new-reservation-dialog/confirm-new-reservation-dialog.component';
import { DetailsService } from '../../../services/details.service';
import { BUFFER_DAYS, RESERVATION_LENGTH } from '../../../shared/constants';

@Component({
  selector: 'app-reserve',
  standalone: true,
  imports: [
    CommonModule, 
    MatDatepickerModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatNativeDateModule, 
    MatDialogModule, 
    FormsModule, 
    ReactiveFormsModule, 
    CustomSnackbarComponent,
    MatTooltipModule
  ],
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReserveComponent implements OnChanges {
  @Input() product!: Product;
  // product!: Product;
  minDate: Date;
  maxDate: Date;
  reservedDates: Date[] = [];
  blockoutDates: Date[] = [];
  showReservationPopup: boolean = false;
  isAgreed: boolean = false;
  showInfoMessage = false;
  ItemInCartMessage: string = 'Item already in Cart';
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private router: Router,
    private reservedDatesService: ReservedDatesService,
    public dialog: MatDialog,
    private cartService: CartService,
    private detailsService: DetailsService,
    private snackBar: MatSnackBar
  ) {
    const today = new Date();
    this.minDate = today;  // Current date
    this.maxDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());  // 1 year from today
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && this.product) {
      // Load reserved dates for the new product
      this.loadReservedDates();
      this.loadBlockoutDates();
    }
  }

  loadReservedDates() {
    if (this.product && this.product.productId) {
      this.reservedDatesService.getReservedDatesByProductId(this.product.productId).subscribe(
        (data: Date[]) => {
          this.reservedDates = data;            
        },
        (error) => {
          console.error('Error fetching reserved dates:', error);
        }
      );
    }
  }

  loadBlockoutDates() {
    this.detailsService.getAllBlockoutDates().subscribe(
      (data: Date[]) => {
        this.blockoutDates = data.map(date => new Date(date)); // Convert to Date objects
        console.log('Fetched blockout dates:', this.blockoutDates);
      },
      (error) => {
        console.error('Error fetching blockout dates:', error);
      }
    );
  }

  // Define the dateFilter function with buffer support
  dateFilter = (date: Date | null): boolean => {
    if (!date) return true;

    // Block out today and the next 9 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tenDaysFromToday = new Date(today);
    tenDaysFromToday.setDate(today.getDate() + 9);

    if (date >= today && date <= tenDaysFromToday) {
      return false;
    }

    // 1. Check buffer for reserved dates
    const isWithinReservedBuffer = this.reservedDates.some((reservedDate) => {
      const bufferStart = new Date(reservedDate);
      const bufferEnd = new Date(reservedDate);
      bufferStart.setDate(bufferStart.getDate() - BUFFER_DAYS);
      bufferEnd.setDate(bufferEnd.getDate() + BUFFER_DAYS);

      return date.getTime() >= bufferStart.getTime() && date.getTime() <= bufferEnd.getTime();
    });

    if (isWithinReservedBuffer) {
      return false;
    }

    // 2. Block exact blockout dates
    const isBlockout = this.blockoutDates.some((blockoutDate) => {
      return (
        blockoutDate.getFullYear() === date.getFullYear() &&
        blockoutDate.getMonth() === date.getMonth() &&
        blockoutDate.getDate() === date.getDate()
      );
    });

    if (isBlockout) {
      return false;
    }

    return true;
  };

  isDateRangeValid(): boolean {
    if (this.range.value.start && this.range.value.end) {
      console.log(`start: ${ this.range.value.start }, end: ${ this.range.value.end }`);
      const diffInTime = this.range.value.end.getTime() - this.range.value.start.getTime();
      const diffInDays = (diffInTime / (1000 * 3600 * 24)) + 1;

      // check if all middle dates are valid
      let current = new Date(this.range.value.start);
      while (current <= this.range.value.end) {
        if (!this.dateFilter(current)) {
          console.log(`Invalid date found: ${current}`);
          return false; // Found an invalid date
        }
        current.setDate(current.getDate() + 1);
      }
      return diffInDays <= RESERVATION_LENGTH; // Check if the range is 5 days or less
    }
    console.log('Invalid date range');
    return false;
  }

  get showUnavailableTooltip(): boolean {
    const start = this.range.get('start')?.value;
    const end = this.range.get('end')?.value;
    return !!start && !!end && !this.isDateRangeValid();
  }

  async onCartClick() {
    if (this.range.invalid) {
      // Create snackbar with error message
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        data: {
          message: `Your selected dates are not avaliable.<br>Open calendar icon to see avaliable dates`,
          action: () => {}, // No action needed
          actionLabel: 'Close'
        },
        duration: 5000,
        panelClass: 'custom-snackbar'
      }); 
      return;
    }
    if (this.isDateRangeValid()) {
      const startDate = this.range.value.start;
      const endDate = this.range.value.end;
  
      if (startDate && endDate) {
        const currentDatesReserved: Date[] = [];
        const currentDate = new Date(startDate);
  
        // Loop through each day from start to end date
        while (currentDate <= endDate) {
          currentDatesReserved.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        for (const group of this.cartService.getReservationMap().values()) {
          const isDuplicate = group.some(cartItem => cartItem.productId === this.product.productId);
          if (isDuplicate) {
            // Create snackbar with item details
            const message = 'Item already in cart.<br>If you want to reserve this item for separate dates,<br>please submit a separate reservation.';
            
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              data: {
                message: message,
                action: () => {}, // No action needed
                actionLabel: 'Close'
              },
              duration: 5000,
              panelClass: 'custom-snackbar'
            });
            return false;
          }
        }

        // Check reservation count
        if (this.cartService.getReservationCount() >= 2) {
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: {
              message: `You can only have 2 reservations for different date ranges at a time.<br><br>
                        Add this item for the same dates as an existing reservation in your cart, or complete your current checkout, then start a new reservation`,
              action: () => {},
              actionLabel: 'Close'
            },
            duration: 15000,
            panelClass: 'custom-snackbar'
          });
          return false;
        }

        const hasMatch = this.cartService.hasMatchingReservationDates(currentDatesReserved);
        if (!hasMatch && this.cartService.getReservationCount() > 0) {
          const dialogRef = this.dialog.open(ConfirmNewReservationDialogComponent);
          const result = await dialogRef.afterClosed().toPromise();

          if (!result) return; // User canceled
        }
  
        const cartItem = {
          productId: this.product.productId,
          name: this.product.name,
          price: this.product.price,
          deposit: this.product.deposit,
          datesReserved: currentDatesReserved,
          imageUrl: this.product.imageUrl,
          quantity: this.product.quantity,
        };
            this.cartService.addToCart(cartItem);
  
          // Create snackbar with item details
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            data: {
              message: `${cartItem.name} added to your cart!`,
              action: () => this.router.navigate(['/cart']),
              actionLabel: 'Go to Cart'
            },
            duration: 5000,
            panelClass: 'custom-snackbar'
          });
      }
    } else {
      // Create snackbar with item details
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        data: {
          message: `Please select a valid date range.<br>${RESERVATION_LENGTH} days max.`,
          action: () => {}, // No action needed
          actionLabel: 'Close'
        },
        duration: 5000,
        panelClass: 'custom-snackbar'
      });
    }
    return true;
  }
  
}
