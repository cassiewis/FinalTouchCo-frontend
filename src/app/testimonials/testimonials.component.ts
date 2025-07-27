import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Review } from '../models/review.model';
import { DetailsService } from '../services/details.service';
import { BannerService } from '../services/banner.service';
import { ErrorBannerComponent } from "../shared/error-banner/error-banner.component";
@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, ErrorBannerComponent],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent implements OnInit {

  reviews: Review[] = [];

  constructor(
    private detailsService: DetailsService,
    private bannerService: BannerService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    console.log("TestimonialsComponent: fetching reviews");
    
    // Fetch reviews
    this.fetchReviews();
  }


  fetchReviews() {
    this.detailsService.getAllReviews().subscribe(
      (reviews) => {
        this.reviews = this.sortReviewsByDate(reviews);
        console.log("fetched reviews: ", this.reviews);
      },
      (error) => {
        console.error('Error fetching reviews:', error);
        this.bannerService.show('There was an error fetching reviews from the server. Please try again later.', 'error');
      }
    );
  }

  sortReviewsByDate(reviews: Review[]): Review[] {
    return reviews.sort((a, b) => {
      const dateA = this.parseDate(a.date);
      const dateB = this.parseDate(b.date);
      
      // Sort by most recent first (descending order)
      return dateB.getTime() - dateA.getTime();
    });
  }

  parseDate(dateString: string): Date {
    // Handle formats like "12/25/23", "1/5/24", "12/1/23", etc.
    const parts = dateString.split('/');
    
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed in JavaScript Date
      const day = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);
      
      // Assume 2-digit years are in 2000s
      if (year < 100) {
        year += 2000;
      }
      
      return new Date(year, month, day);
    }
    
    // Fallback: return current date if parsing fails
    console.warn(`Could not parse date: ${dateString}`);
    return new Date();
  }

  navigateToInspo() {
    console.log("TestimonialsComponent: navigating to inspo");
    this.router.navigate(['/inspo']).then(() => {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    });
  }


}