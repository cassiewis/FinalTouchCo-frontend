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
    navigateWithScroll(this.router, event, `/shop}`, { custom: 'Custom' });
  }
}
