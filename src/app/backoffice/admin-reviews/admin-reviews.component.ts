import { Component } from '@angular/core';
import { DetailsService } from '../../services/details.service';
import { Review } from '../../models/review.model';
import { CommonModule } from '@angular/common';
import { AdminAddReviewComponent } from '../admin-shared/admin-add-review/admin-add-review.component';
import { AdminDetailsService } from '../admin-services/admin-details.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, AdminAddReviewComponent],
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.css'
})
export class AdminReviewsComponent {
  reviews: Review[] = [];

  constructor(private detailsService: DetailsService, private adminDetailsService: AdminDetailsService) {}

  ngOnInit(): void {
    this.fetchReviews();
  }

  fetchReviews(): void {
    this.detailsService.getAllReviews().subscribe(
      (reviews: Review[]) => {
        this.reviews = reviews;
        console.log('Fetched reviews:', this.reviews);
      },
      (error) => {
        console.error('Error fetching reviews:', error);
      }
    );
  }

  deleteReview(reviewId: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this review?');
    if (!confirmed) {
      return;
    }
    this.adminDetailsService.deleteReview(reviewId).subscribe(
      () => {
        console.log('Review deleted successfully');
        this.fetchReviews(); // Refresh the list after deletion
      },
      (error) => {
        console.error('Error deleting review:', error);
      }
    );
  }

  addReview(review: Review): void {
    this.adminDetailsService.addReview(review).subscribe(
      (newReview: Review) => {
        console.log('Review added successfully:', newReview);
        this.fetchReviews(); // Refresh the list after adding
      },
      (error) => {
        console.error('Error adding review:', error);
      }
    );
  }
}
