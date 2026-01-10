import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  cartCount: number = 0;
  private cartCountSubscription!: Subscription; // Use non-null assertion
  isMobileMenuOpen = false;

  constructor() {}


  toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
      this.isMobileMenuOpen = false;
  }
}
