import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Review } from '../../../models/review.model';
import { DetailsService } from '../../../services/details.service';
import { navigateWithScroll } from '../../../shared/constants'; // Assuming you have a utility function for navigation with scroll
@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent implements OnInit, OnDestroy {
    reviews: Review[] = [];
    currentIndex: number = 0;
    private intervalId!: any;

    // constructor
    constructor(private router: Router, private detailsService: DetailsService){};
  
    ngOnInit(): void {
      // Start the automatic carousel
      this.startCarousel();

      this.reviews = this.detailsService.getFeaturedReviews();
    }
  
    ngOnDestroy(): void {
      // Clean up the interval when the component is destroyed
      clearInterval(this.intervalId);
    }
  
    startCarousel(): void {
      this.intervalId = setInterval(() => {
        this.showNextReview();
      }, 3000); // Switch every 3 seconds
    }
  
    showNextReview(): void {
      this.currentIndex = (this.currentIndex + 1) % this.reviews.length;
    }
  
    showPreviousReview(): void {
      this.currentIndex = (this.currentIndex - 1 + this.reviews.length) % this.reviews.length;
    }
  
    getTransformStyle(): string {
      return `translateX(-${this.currentIndex * 100}%)`;
    }

    routeToInspo(event: MouseEvent) {
      navigateWithScroll(this.router, event, `/inspo}`);
    }
}