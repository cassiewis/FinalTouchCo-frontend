import { Component, OnInit } from '@angular/core';
import { AdminAddBlockoutDatesComponent } from '../admin-shared/admin-add-blockout-date/admin-add-blockout-dates.component';
import { CommonModule } from '@angular/common';
import { BlockoutDate } from '../../models/blockoutDates'; // Adjust the import path as necessary
import { DetailsService } from '../../services/details.service'; // Adjust the import path as necessary
import { AdminDetailsService } from '../admin-services/admin-details.service'; // Adjust the import path as necessary

@Component({
  selector: 'app-admin-blockout-dates',
  standalone: true,
  imports: [
    CommonModule,
    AdminAddBlockoutDatesComponent
  ],
  templateUrl: './admin-blockout-dates.html',
  styleUrl: './admin-blockout-dates.css'
})
export class AdminBlockoutDates implements OnInit {
  blockoutDates: BlockoutDate[] = [];
  newBlockoutDate: Date | null = null;
  loading: boolean = true;

  constructor(
    private detailsService: DetailsService,
    private adminDetailsService: AdminDetailsService
  ) {}

  ngOnInit() {
    // Simulate fetching blockout dates from a service
    this.fetchBlockoutDates();
  }

  fetchBlockoutDates() {
    this.adminDetailsService.getAllBlockoutDates().subscribe(
      (blockoutDates: BlockoutDate[]) => {
        this.blockoutDates = blockoutDates;
        console.log('Fetched reviews:', this.blockoutDates);
      },
      (error) => {
        console.error('Error fetching reviews:', error);
      }
    );
  }

  displayDates(blockout: BlockoutDate): string {
    if (blockout.dates) {
      const startDate = new Date(blockout.dates[0]);
      const endDate = new Date(blockout.dates[blockout.dates.length-1]);
      const year = startDate.getFullYear();

      // Format each date to only show month (short name) and day
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const startFormatted = startDate.toLocaleDateString('en-US', options);
      const endFormatted = endDate.getDate(); // Only show the day for the end date

      return `${startFormatted}-${endFormatted}, ${year}`;
    }
    return 'No dates';
  }

  deleteBlockout(blockoutDateId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this blockout date?');
    if (!confirmed) {
      return;
    }
    this.adminDetailsService.removeBlockoutDates(blockoutDateId).subscribe(
      () => {
        console.log('Blockout Date deleted successfully');
        this.fetchBlockoutDates(); // Refresh the list after deletion
      },
      (error) => {
        console.error('Error deleting Blockout Date:', error);
      }
    );
  }

}
