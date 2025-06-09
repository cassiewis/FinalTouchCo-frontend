import { Component } from '@angular/core';
import { HeroComponent } from "./hero/hero.component";
import { AboutComponent } from "./about/about.component";
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { QuickViewComponent } from "./quick-view/quick-view.component"
import { TestimonialsComponent } from "./testimonials/testimonials.component";
import { CustomComponent } from './custom/custom.component';
import { FaqsComponent } from './faqs/faqs.component';
import { ContactMeComponent } from './contact-me/contact-me.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [HeroComponent, AboutComponent, CustomComponent, HowItWorksComponent, QuickViewComponent, ContactMeComponent, TestimonialsComponent, FaqsComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  appTitle = 'MyDreamWeddingByCass';
  subTitle = 'Easy Event Rentals in the Treasure Valley';
}
