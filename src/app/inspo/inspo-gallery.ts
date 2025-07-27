import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ImageService } from '../services/image.service';
import { BannerService } from '../services/banner.service';
import { ErrorBannerComponent } from "../shared/error-banner/error-banner.component";

@Component({
  selector: 'app-inspo-gallery',
  standalone: true,
  imports: [CommonModule, ErrorBannerComponent],
  templateUrl: './inspo-gallery.component.html',
  styleUrl: './inspo-gallery.component.css'
})
export class InspoGalleryComponent implements OnInit {

  inspoPhotos: string[] = [];

  constructor(
    private imageService: ImageService,
    private bannerService: BannerService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    console.log("InspoGalleryComponent: fetching inspirations");
        
    // Fetch inspo photos
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

  navigateToTestimonials() {
    console.log("InspoGalleryComponent: navigating to testimonials");
    this.router.navigate(['/testimonials']).then(() => {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    });
  }
}
