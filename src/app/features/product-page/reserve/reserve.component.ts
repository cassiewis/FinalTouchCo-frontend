import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../../../shared/custom-snackbar/custom-snackbar.component';
import { ReservedDatesService } from '../../../services/reserved-dates.service';
import { ConfirmNewReservationDialogComponent } from '../../../shared/confirm-new-reservation-dialog/confirm-new-reservation-dialog.component';
import { BUFFER_DAYS } from '../../../shared/constants';
@Component({
  selector: 'app-reserve',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatInputModule, MatFormFieldModule, MatNativeDateModule, MatDialogModule, FormsModule, ReactiveFormsModule, CustomSnackbarComponent],
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReserveComponent implements OnChanges {
  @Input() product!: Product;
  // product!: Product;
  minDate: Date;
  maxDate: Date;
  reservedDates: Date[];
  showReservationPopup: boolean = false;
  isAgreed: boolean = false;
  ItemInCartMessage: string = 'Item already in Cart';
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private reservedDatesService: ReservedDatesService,
    public dialog: MatDialog,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {
    const today = new Date();
    this.minDate = today;  // Current date
    this.maxDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());  // 1 year from today
    this.reservedDates = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && this.product) {
      // Load reserved dates for the new product
      this.loadReservedDates();
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


// Define the dateFilter function with buffer support
dateFilter = (date: Date | null): boolean => {
  if (!date) return true; // Enable if the date is null

  // Block out today and the next 9 days
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight
  const tenDaysFromToday = new Date(today);
  tenDaysFromToday.setDate(today.getDate() + 9);

  if (date >= today && date <= tenDaysFromToday) {
    return false;
  }

  // // Check if the current date is within the buffer range of any reserved date
  const isDateDisabled = this.reservedDates.some((reservedDate) => {
    // Calculate start and encd of buffer period
    const reserved = new Date(reservedDate).getTime();
    const bufferStart = new Date(reservedDate);
    const bufferEnd = new Date(reservedDate);
    bufferStart.setDate(bufferStart.getDate() - BUFFER_DAYS);
    bufferEnd.setDate(bufferEnd.getDate() + BUFFER_DAYS);

    // Check if the current date falls within this buffer range
    const isWithinBuffer =
      date.getTime() >= bufferStart.getTime() && date.getTime() <= bufferEnd.getTime();

    if (isWithinBuffer) {
      console.log(
        `Date ${date} is within buffer of reserved date ${reservedDate}. Disabling.`
      );
    }
    return isWithinBuffer;
  });
  return !isDateDisabled;
};

  isDateRangeValid(): boolean {
    if (this.range.value.start && this.range.value.end) {
      console.log(`start: ${ this.range.value.start }, end: ${ this.range.value.end }`);
      const diffInTime = this.range.value.end.getTime() - this.range.value.start.getTime();
      const diffInDays = (diffInTime / (1000 * 3600 * 24)) + 1;
      return diffInDays <= 5;
    }
    return false;
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
          count: 1, // Default count to 1 but change when 
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
          message: `Please select a valid date range.<br>5 days max.`,
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
