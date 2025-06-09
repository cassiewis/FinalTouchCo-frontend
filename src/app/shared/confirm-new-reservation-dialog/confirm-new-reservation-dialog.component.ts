import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-new-reservation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirm-new-reservation-dialog.component.html',
  styleUrl: './confirm-new-reservation-dialog.component.css'
})
export class ConfirmNewReservationDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmNewReservationDialogComponent>) {}

}
