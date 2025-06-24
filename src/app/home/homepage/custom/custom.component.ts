import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { navigateWithScroll } from '../../../shared/constants'; // Assuming you have a utility function for navigation with scroll
@Component({
  selector: 'app-custom',
  standalone: true,
  imports: [],
  templateUrl: './custom.component.html',
  styleUrl: './custom.component.css'
})
export class CustomComponent {

  constructor(private router: Router) {}

  goToCustomShop(event?: MouseEvent){
    // Check if cmd/ctrl key was pressed (for opening in new tab)
    navigateWithScroll(this.router, event, `/shop`, { custom: 'Custom' }); 
  }
}
