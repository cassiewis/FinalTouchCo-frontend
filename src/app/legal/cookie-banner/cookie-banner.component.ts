import { Component } from '@angular/core';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [],
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.css'
})
export class CookieBannerComponent {

  
  showBanner = false;
  private readonly cookieAcceptedKey = 'cookieBannerAccepted';

  ngOnInit(): void {
    if (!localStorage.getItem(this.cookieAcceptedKey)) {
      this.showBanner = true;

      setTimeout(() => {
        this.showBanner = false;
        localStorage.setItem(this.cookieAcceptedKey, 'true');
      }, 7000);
    }
  }

  closeBanner(): void {
    this.showBanner = false;
    localStorage.setItem(this.cookieAcceptedKey, 'true');
  }
}
