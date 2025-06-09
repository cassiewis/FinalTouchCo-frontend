import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerService, BannerMessage } from '../../services/banner.service';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.css'
})
export class ErrorBannerComponent {
  banner: BannerMessage | null = null;

  constructor(private bannerService: BannerService) {
    this.bannerService.banner$.subscribe(msg => this.banner = msg);
  }

  clear() {
    this.bannerService.clear();
  }

}
