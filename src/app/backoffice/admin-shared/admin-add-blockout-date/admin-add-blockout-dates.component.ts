import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // for date picker functionality
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminDetailsService } from '../../admin-services/admin-details.service';
import { BlockoutDate } from '../../../models/blockoutDates';

@Component({
  selector: 'app-admin-add-blockout-dates',
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
  templateUrl: './admin-add-blockout-dates.component.html',
  styleUrl: './admin-add-blockout-dates.component.css'
})
export class AdminAddBlockoutDatesComponent {
  popupOpen: boolean = false;
  blockout: BlockoutDate = {
    id: '',
    reason: '',
    notes: '',
    dates: []
  }

  constructor(
    private snackBar: MatSnackBar,
    private adminDetailsService: AdminDetailsService
  ){}


  openBlockoutCreator() {
    this.popupOpen = true;
  }

  closeBlockoutCreator() {
    this.popupOpen = false;
  }

  createBlockoutDate() {
    const generatedstring = Math.random().toString(36).substring(2, 10);
    this.blockout.id = generatedstring;

    // Generate all dates in the range
    const start = new Date(this.blockout.dates[0]);
    const end = new Date(this.blockout.dates[1]);
    const allDates: Date[] = [];

    let current = new Date(start);
    while (current <= end) {
      allDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    this.blockout.dates = allDates;

    console.log("Trying to add blockout date: " + this.blockout);

    this.adminDetailsService.addBlockoutDates(this.blockout).subscribe(
      (response: BlockoutDate) => {
        console.log('blockout dates added successfully:', response);
        this.closeBlockoutCreator();
        window.location.reload();
      },
      (error: any) => {
        console.error('Error adding blockout dates:', error);
        this.displayError(error);
      }
    );

  }

  displayError(error: any): void {
    let errorMessage = 'An error occurred while creating your blockout-date.';

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
