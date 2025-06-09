import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [],
  templateUrl: './success-page.component.html',
  styleUrl: './success-page.component.css'
})
export class SuccessPageComponent implements OnInit {
  successMessage: string = 'Your order has been successfully placed! Thank you for shopping with us.';

  ngOnInit(): void {
    window.scrollTo(0, 0); 
  }


}
