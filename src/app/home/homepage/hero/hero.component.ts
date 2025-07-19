import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { navigateWithScroll } from '../../../shared/constants'; // Assuming you have a utility function for navigation with scroll
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {

  constructor(private router: Router) {}

  routeToShop(event?: MouseEvent) {
    navigateWithScroll(this.router, event, `/shop`);
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
}
