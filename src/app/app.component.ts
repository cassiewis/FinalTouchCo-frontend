import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProductService } from './services/product.service';
import { HeaderComponent } from "./shared/header/header.component";
import { FooterComponent } from './shared/footer/footer.component';
import { CookieBannerComponent } from './legal/cookie-banner/cookie-banner.component';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CookieBannerComponent,
    CommonModule,
    HttpClientModule,
    HeaderComponent,
    FooterComponent
],
  templateUrl: './app.component.html',
  providers: [ProductService], // Add any services you need
  styleUrl: './app.component.css'
})
export class AppComponent {

  showHeader: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const hiddenPrefixes = ['/cart', '/checkout', '/admin', '/construction'];
        this.showHeader = !hiddenPrefixes.some(prefix => event.urlAfterRedirects.startsWith(prefix));
      }
    });
  }

  isBackOfficeRoute(): boolean {
    // Check if the current route is your back office route
    const returnValue = this.router.url.startsWith('/backoffice'); // Adjust the condition based on your route
    return returnValue;
  }


  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-98SE5XYCB5', {
          page_path: event.urlAfterRedirects,
        });
      }
    });
  }


}
