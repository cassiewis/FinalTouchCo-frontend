import { Component } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { EMAIL } from '../../shared/constants';

@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [],
  templateUrl: './success-page.component.html',
  styleUrl: './success-page.component.css'
})
export class SuccessPageComponent implements AfterViewInit {
  successMessage: string = 'Your order has been successfully placed! Thank you for shopping with us.';
  email = EMAIL;

  ngAfterViewInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    console.log('SuccessPageComponent view initialized');
  }


}
