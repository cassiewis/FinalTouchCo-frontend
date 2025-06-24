import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageService } from '../services/image.service';
import { Review } from '../models/review.model';
import { DetailsService } from '../services/details.service';
import { BannerService } from '../services/banner.service';
import { ErrorBannerComponent } from "../shared/error-banner/error-banner.component";
@Component({
  selector: 'app-inspo',
  standalone: true,
  imports: [CommonModule, ErrorBannerComponent],
  templateUrl: './inspo.component.html',
  styleUrl: './inspo.component.css'
})
export class InspoComponent implements OnInit {

  inspoOpen = true;
  inspoPhotos: string[] = [];
  reviews: Review[] = [];

  constructor(
    private imageService: ImageService, 
    private detailsService: DetailsService,
    private bannerService: BannerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // on load, fetch inspo photos from the backend
  ngOnInit() {
    console.log("InspoComponent: fetching inspirations");
    
    // Determine which section to show based on route
    this.route.url.subscribe(urlSegments => {
      const currentPath = urlSegments[0]?.path;
      this.inspoOpen = currentPath !== 'testimonials';
      
      // Always fetch inspo photos
      this.fetchInspoPhotos();
      
      // Fetch reviews if we're on testimonials page
      if (!this.inspoOpen) {
        this.fetchReviews();
      }
    });
  }

  fetchInspoPhotos() {
    this.imageService.getInspoImageUrls().subscribe(
      (imageUrls) => {
        this.inspoPhotos = imageUrls;
        console.log('Fetched images:', this.inspoPhotos);
      },
      (error) => {
        console.error('Error fetching images:', error);
        this.bannerService.show('There was an error fetching inspo photos from the server. Please try again later. You can also see our inspo photos on our instagram @final.touch.co', 'error');
      }
    );
  }

  fetchReviews() {
    this.detailsService.getAllReviews().subscribe(
      (reviews) => {
      this.reviews = reviews;
    },
    (error) => {
      console.error('Error fetching reviews:', error);
      this.bannerService.show('There was an error fetching reviews from the server. Please try again later.', 'error');
    });
    console.log("fetched reviews: ", this.reviews);
  }

  togglePage() {
    console.log("InspoComponent: toggling page");
    
    if (this.inspoOpen) {
      // Navigate to testimonials
      this.router.navigate(['/testimonials']).then(() => {
        // Scroll to top of testimonials page
        setTimeout(() => {
          const headerContainer = document.querySelector('.header-container');
          if (headerContainer) {
            headerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo(0, 0);
          }
        }, 100);
      });
    } else {
      // Navigate to inspo
      this.router.navigate(['/inspo']).then(() => {
        // Scroll to top of inspo page
        setTimeout(() => {
          const headerContainer = document.querySelector('.header-container');
          if (headerContainer) {
            headerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo(0, 0);
          }
        }, 100);
      });
    }
  }


}