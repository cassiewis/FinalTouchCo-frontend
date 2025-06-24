import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { navigateWithScroll } from '../../shared/constants'; // Assuming you have a utility function for navigation with scroll

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {

  constructor(
    private router: Router,
  ) {}

  routeHome(event?: MouseEvent){
    navigateWithScroll(this.router, event, `/home`);
  }


}
