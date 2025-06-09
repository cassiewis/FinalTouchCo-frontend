import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAddReservationComponent } from '../admin-shared/admin-add-reservation/admin-add-reservation.component';
import { HttpClientModule } from '@angular/common/http';
import { Reservation } from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import { AdminReservationsService } from '../admin-services/admin-reservations.service';
import { MatDialog } from '@angular/material/dialog';
import { AdminReservationBoxComponent } from '../admin-shared/admin-reservation-box/admin-reservation-box.component';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    AdminAddReservationComponent,
    AdminReservationBoxComponent,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './admin-reservations.component.html',
  styleUrl: './admin-reservations.component.css'
})
export class AdminReservationsComponent {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];  // Array for filtered reservations
  selectedStatuses: string[] = []; // Array to track selected statuses
  loading: boolean = true;

  constructor(private reservationService: ReservationService, private adminReservationsService: AdminReservationsService, private dialog: MatDialog) {}

  ngOnInit(): void {
    // Get reservations from service
    this.adminReservationsService.getAdminReservations().subscribe(
      (reservations: Reservation[]) => {
        // Separate reservations into those pending approval and others
        this.reservations = reservations;
        console.log('Reservations:', this.reservations); // Debugging
        this.filteredReservations = [...this.reservations]; // Initialize filtered list
        console.log('filteredReservations:', this.filteredReservations); // Debugging
        this.loading = false;

        // Always keep 'approval needed' reservations separate
        // this.pendingReservations = reservations.filter(reservation => reservation.status === 'pending');

        // Sort reservations by date
        this.reservations.sort((a, b) => {
          const dateA = new Date(a.dates[0]);
          const dateB = new Date(b.dates[0]);
          return dateA.getTime() - dateB.getTime();
        });
      },
      (error) => {
        console.error('Error loading reservations:', error);  // Error handling
      }
    );
  }

  onFilterChange(status: string, event: any): void {
    if (event.target.checked) {
      this.selectedStatuses.push(status);
    } else {
      this.selectedStatuses = this.selectedStatuses.filter(item => item !== status);
    }

    console.log('Selected Statuses:', this.selectedStatuses); // Debugging

    this.applyFilters();
  }

  applyFilters(): void {
    if (this.selectedStatuses.length === 0) {
      // If no filter is selected, show all reservations
      this.filteredReservations = this.reservations;
    } else {
      // Apply filter to reservations based on selected statuses
      this.filteredReservations = this.reservations.filter(reservation =>
        this.selectedStatuses.includes(reservation.status)
      );
    }

    console.log('Filtered Reservations:', this.filteredReservations); // Debugging
  }

  refreshReservations(): void {
    console.log("refreshed");
    this.adminReservationsService.fetchReservations().subscribe(
      (reservations: Reservation[]) => {
        console.log("Reservations refreshed:", reservations);
        this.reservations = reservations;
        this.filteredReservations = [...this.reservations]; // Update filtered list
      },
      (error) => {
        console.error("Error refreshing reservations:", error);
      }
    );
  }
}
