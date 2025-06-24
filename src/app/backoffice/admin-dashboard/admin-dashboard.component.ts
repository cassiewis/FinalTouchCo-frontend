import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAddProductComponent } from '../admin-shared/admin-add-product/admin-add-product.component';
import { AdminAddReservationComponent } from '../admin-shared/admin-add-reservation/admin-add-reservation.component';
import { Reservation } from '../../models/reservation.model';
import { Product } from '../../models/product.model';
import { AdminReservationsService } from '../admin-services/admin-reservations.service';
import { AdminProductService } from '../admin-services/admin-product.service';
import { AdminDetailsService } from '../admin-services/admin-details.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SEND_INVOICE_DAYS, PAYMENT_DUE_DAYS } from '../../shared/constants';
import {
  Chart,
  ChartConfiguration,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { BlockoutDate } from '../../models/blockoutDates';

@Component({
  selector: 'app-backoffice-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdminAddProductComponent,
    AdminAddReservationComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements AfterViewInit {
  @ViewChild('myChart', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;


  public reservations: Reservation[] = [];
  public pendingReservations: Reservation[] = [];
  public upcomingReservations: Reservation[] = [];
  public fulfilledReservations: Reservation[] = [];
  public now = new Date(); // Current date
  public activeProducts: Product[] = [];
  public tasks: Map<string, Reservation> = new Map();
  public blockouts: BlockoutDate[] = [];

  constructor(
    private adminReservationService: AdminReservationsService, 
    private adminProductService: AdminProductService,
    private adminDetailsService: AdminDetailsService,
    private router: Router
    ){
      // Register required Chart.js components
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip);
  }

  ngOnInit() {
    
    this.adminReservationService.getAdminReservations().subscribe(
      (reservations: Reservation[]) => {
        // Separate reservations into those pending approval and others
        this.reservations = reservations;
        this.fulfilledReservations = reservations.filter(reservation => reservation.status === 'fulfilled');
        
        // Sort reservations by date
        this.reservations.sort((a, b) => {
          const dateA = new Date(a.dates[0]);
          const dateB = new Date(b.dates[0]);
          return dateA.getTime() - dateB.getTime();
        });

        this.upcomingReservations = this.reservations.filter(reservation => {
          const reservationDate = new Date(reservation.dates[0]); // Assuming first date is the start
          return reservationDate >= this.now; // Only include future dates
        });

        this.setTasks();
      }
    );

    this.adminProductService.getAdminProducts().subscribe(
      (products: Product[]) => {
        // Separate reservations into those pending approval and others
        this.activeProducts = products;
      }
    );

    this.adminDetailsService.getAllBlockoutDates().subscribe(
      (blockouts: BlockoutDate[]) => {
        this.blockouts = blockouts;
        console.log("Blockout Dates: ", this.blockouts);
      }
    );
  }

  ngAfterViewInit(): void {
    // Add a small delay to ensure the DOM is fully rendered
    setTimeout(() => {
      if (!this.isChildRouteActive()) {
        this.createBarChart();
      }
    }, 100);
  }

  isChildRouteActive(): boolean {
    return this.router.url !== '/admin';
  }

  setTasks(): void {  
    // Loop through all the reservations
    this.reservations.forEach(reservation => {
      const firstDate = new Date(reservation.dates[0]); // Assuming the first date is the start date of the reservation
      const lastDate = new Date(reservation.dates[reservation.dates.length - 1]); // Assuming the last date is the end date
      const now = new Date();
  
      // 1. Check if reservation status is 'pending' (key = "Pending Order")
      if (reservation.status === 'pending') {
        this.tasks.set("Pending Order", reservation );
        console.log("Pending Reservation added to tasks");
      }
  
      // 2. Check if reservation date is 110 days or less from the first date, and invoiceStatus == 'not sent' (key = "Pay Invoice")
      const daysToFirstDate = Math.floor((firstDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (daysToFirstDate <= (SEND_INVOICE_DAYS+2) && reservation.invoiceStatus === 'not sent') {
        this.tasks.set("Send Invoice", reservation );
      }
  
      // 3. Check if reservation date is 100 days or less from the first date, and paymentStatus == 'not received' (key = "Pay Invoice")
      if (daysToFirstDate <= PAYMENT_DUE_DAYS && reservation.paymentStatus === 'not received') {
        this.tasks.set("Payment Due", reservation );
      }
    });
  }
  
  prepareChartData(): { labels: string[], data: number[] } {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    const reservationsByMonth = this.getUpcomingReservationsByMonth();
    console.log("ReservationsByMonth: " + reservationsByMonth);
    const labels: string[] = [];
    const data: number[] = [];
  
    // Generate labels and data for each month from the current month onwards
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      const monthKey = `${year}-${monthIndex}`;
  
      labels.push(`${monthNames[monthIndex]}`); // e.g., "Nov 2024"
      data.push(reservationsByMonth[monthKey] || 0); // Default to 0 if no reservations
    }
  
    return { labels, data };
  }

createBarChart(): void {
  if (!this.chartCanvas?.nativeElement) {
    console.warn('Chart canvas not available');
    return;
  }
  
  const ctx = this.chartCanvas.nativeElement.getContext('2d');
  if (!ctx) {
    console.warn('Could not get 2D context from canvas');
    return;
  }

  const chartData = this.prepareChartData();

  // Find the maximum value in the data to determine the upper Y-axis limit
  const maxDataValue = Math.max(...chartData.data);
  // Set the Y-axis minimum to 5, but ensure it doesn't exceed the max value
  const yAxisMax = maxDataValue < 5 ? 5 : maxDataValue;

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Upcoming Orders',
        data: chartData.data,
        backgroundColor: '#DFA1A3',
        borderWidth: 1,
      },
    ],
  };

  const config: ChartConfiguration = {
    type: 'bar',
    data,
    options: {
      responsive: true,
      scales: {
        x: {
          grid: {
            display: false,  // Disable vertical grid lines (for x axis)
          }
        },
        y: {
          beginAtZero: true,
          max: yAxisMax, // Set the Y-axis minimum value
          min: 0,
          ticks: {
            stepSize: 1,
          }
        },
      },
    },
  };

  new Chart(ctx, config);
}

getUpcomingReservationsByMonth(): { [key: string]: number } {
  const currentMonth = this.now.getMonth();
  const currentYear = this.now.getFullYear();

  // Group by month and count reservations
  const reservationsByMonth: { [key: string]: number } = {};

  this.upcomingReservations.forEach(reservation => {
    const reservationDate = new Date(reservation.dates[0]);
    const monthKey = `${reservationDate.getFullYear()}-${reservationDate.getMonth()}`; // "Year-Month"

    console.log(`Processing reservation on: ${reservationDate} -> MonthKey: ${monthKey}`);

    if (!reservationsByMonth[monthKey]) {
      reservationsByMonth[monthKey] = 0;
    }
    reservationsByMonth[monthKey]++;
  });

  console.log("Reservations Grouped By Month: ", reservationsByMonth);
  return reservationsByMonth;
}


  public getTotalRevenue(): number {
    if (!this.fulfilledReservations) {
      return 0;
    }
  
    return this.fulfilledReservations.reduce((total, reservation) => {
      return total + reservation.price;
    }, 0);
  }

  public displayDate(date: string | Date): string {
    // Ensure the input is a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
  
    // Format the date as MM/DD
    const month = dateObj.getMonth() + 1; // Months are zero-based
    const day = dateObj.getDate();
  
    return `${month}/${day}`;
  }

}
