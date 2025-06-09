import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
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
    private bannerService: BannerService
  ) {}

  // on load, fetch inspo photos from the backend
  ngOnInit() {
    console.log("InspoComponent: fetching inspirations");
    this.fetchInspoPhotos();
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
    this.inspoOpen = !this.inspoOpen;
    console.log("InspoComponent: toggling page");

    if (!this.inspoOpen && this.reviews.length === 0) {
      this.fetchReviews();
    }
  }


}