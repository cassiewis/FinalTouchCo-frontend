import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAddProductComponent } from '../admin-shared/admin-add-product/admin-add-product.component';
import { AdminAddReservationComponent } from '../admin-shared/admin-add-reservation/admin-add-reservation.component';
import { Reservation } from '../../models/reservation.model';
import { Product } from '../../models/product.model';
import { ReservationService } from '../../services/reservation.service';
import { AdminReservationsService } from '../admin-services/admin-reservations.service';
import { ProductService } from '../../services/product.service';
import { AdminProductService } from '../admin-services/admin-product.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
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
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  // public pendingApprovalReservations: Reservation[] = [];
  public reservations: Reservation[] = [];
  public pendingReservations: Reservation[] = [];
  public upcomingReservations: Reservation[] = [];
  public fulfilledReservations: Reservation[] = [];
  public now = new Date(); // Current date
  public activeProducts: Product[] = [];
  public tasks: Map<string, Reservation> = new Map();

  constructor(
    private reservationService: ReservationService, 
    private adminReservationService: AdminReservationsService, 
    private productService: ProductService,
    private adminProductService: AdminProductService,
    private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService
  ){
      // Register required Chart.js components
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip);
  }

  ngOnInit() {
    
    // temp print out admin key
    console.log("Admin Key: ", this.authService.getToken());



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
  }

  ngAfterViewInit(): void {
    this.createBarChart();
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
      if (daysToFirstDate <= 105 && reservation.invoiceStatus === 'not sent') {
        this.tasks.set("Send Invoice", reservation );
      }
  
      // 3. Check if reservation date is 100 days or less from the first date, and paymentStatus == 'not received' (key = "Pay Invoice")
      if (daysToFirstDate <= 90 && reservation.paymentStatus === 'not received') {
        this.tasks.set("Payment Due", reservation );
      }
  
      // 4. Check if reservation date is 12 days or more from the last date, and depositStatus == 'not sent' (key = "Pay Invoice")
      const daysFromLastDate = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (daysFromLastDate >= 10 && reservation.depositStatus === 'not sent') {
        this.tasks.set("Send Deposit", reservation );
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
  const ctx = (document.getElementById('myChart') as HTMLCanvasElement).getContext('2d');
  if (ctx) {
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
