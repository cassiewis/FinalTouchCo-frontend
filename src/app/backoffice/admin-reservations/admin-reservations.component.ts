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

  // Method to get count of reservations by status
  getStatusCount(status: string): number {
    return this.reservations.filter(reservation => reservation.status === status).length;
  }

  // Method to sort reservations with priority order
  sortReservations(reservations: Reservation[]): Reservation[] {
    const statusPriority = { 'pending': 1, 'active': 1, 'fulfilled': 2, 'canceled': 3 };
    
    return reservations.sort((a, b) => {
      // First sort by status priority
      const statusComparison = (statusPriority[a.status as keyof typeof statusPriority] || 5) - 
                              (statusPriority[b.status as keyof typeof statusPriority] || 5);
      
      if (statusComparison !== 0) {
        return statusComparison;
      }
      
      // Then sort by date within same status
      const dateA = new Date(a.dates[0]);
      const dateB = new Date(b.dates[0]);
      return dateA.getTime() - dateB.getTime();
    });
  }

  ngOnInit(): void {
    // Get reservations from service
    this.adminReservationsService.getAdminReservations().subscribe(
      (reservations: Reservation[]) => {
        // Sort reservations with priority order (pending/active first, then fulfilled/canceled)
        this.reservations = this.sortReservations(reservations);
        console.log('Reservations:', this.reservations); // Debugging
        this.filteredReservations = [...this.reservations]; // Initialize filtered list
        console.log('filteredReservations:', this.filteredReservations); // Debugging
        this.loading = false;
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
      // If no filter is selected, show all reservations (already sorted)
      this.filteredReservations = this.reservations;
    } else {
      // Apply filter to reservations based on selected statuses and maintain sorting
      const filtered = this.reservations.filter(reservation =>
        this.selectedStatuses.includes(reservation.status)
      );
      this.filteredReservations = this.sortReservations(filtered);
    }

    console.log('Filtered Reservations:', this.filteredReservations); // Debugging
  }

  refreshReservations(): void {
    console.log("refreshed");
    this.loading = true;
    this.adminReservationsService.fetchReservations().subscribe(
      (reservations: Reservation[]) => {
        console.log("Reservations refreshed:", reservations);
        // Sort reservations with priority order
        this.reservations = this.sortReservations(reservations);
        // Reapply current filters
        this.applyFilters();
        this.loading = false;
      },
      (error) => {
        console.error("Error refreshing reservations:", error);
        this.loading = false;
      }
    );
  }

  onReservationAdded(): void {
    console.log("New reservation added - refreshing list");
    this.refreshReservations();
  }
}
