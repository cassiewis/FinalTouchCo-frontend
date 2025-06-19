import { Component } from '@angular/core';
import { EMAIL } from '../../../shared/constants';
@Component({
  selector: 'app-contact-me',
  standalone: true,
  imports: [],
  templateUrl: './contact-me.component.html',
  styleUrl: './contact-me.component.css'
})
export class ContactMeComponent {
  email = EMAIL;

}
