import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesQuoteFormComponent } from './services-quote-form/services-quote-form.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-our-services',
  standalone: true,
  imports: [CommonModule, ServicesQuoteFormComponent],
  templateUrl: './our-services.component.html',
  styleUrl: './our-services.component.css'
})
export class OurServicesComponent {

  constructor(private router: Router) {}

 scrollToSection(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      console.log("Scrolled to element:", elementId);
    } else {
      console.warn("Element not found:", elementId);
    }
  }

}
