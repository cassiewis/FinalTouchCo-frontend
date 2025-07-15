import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { EMAIL, navigateWithScroll } from '../../shared/constants';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  inspoImages!: boolean;
  EMAIL = EMAIL;

  constructor(private router: Router) {}

  routeTo(path: string, event?: MouseEvent) {
    navigateWithScroll(this.router, event, path);
  }

  routeToWithFilter(filterName: string, event?: MouseEvent) {
      navigateWithScroll(this.router, event, '/shop', { filters: filterName }); 
  }

  routeToCustomShop(event?: MouseEvent) {
    navigateWithScroll(this.router, event, '/shop', { custom: "Custom" }); 
  }

  routeToSection(path: string, fragment: string) {
    this.router.navigate([path], { fragment: fragment }).then(() => {
      // Use setTimeout to ensure navigation completes before trying to scroll
      setTimeout(() => {
        const element = document.getElementById(fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0); // delay the execution to ensure navigation finishes first
    });
  }

  routeToInstagram() {
    window.open('https://www.instagram.com/finaltouchdecor.boise/', '_blank');
  }

  routeToFacebook() {
    window.open('https://www.facebook.com/profile.php?id=61573848536553', '_blank');
  }

  routeToEmail() {
    const email = EMAIL;
    window.location.href = `mailto:${email}`;
  }

  routeToReview() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSevs_gtQs1Tuic-veWSx9PAbzuqhz8jW02wfzgc-EfTb2RmdA/viewform?usp=header', '_blank');
  }
}
