import { Component } from '@angular/core';
import { navigateWithScroll } from '../../../shared/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.css'
})
export class HowItWorksComponent {

  constructor(private router: Router) {}

  goToServices(event: MouseEvent){
      navigateWithScroll(this.router, event, '/services');
    }
}
