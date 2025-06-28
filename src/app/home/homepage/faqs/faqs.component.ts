import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HowItWorksComponent } from '../how-it-works/how-it-works.component';
import { EMAIL, RESERVATION_LENGTH, MINIMUM_ORDER } from '../../../shared/constants';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule, HowItWorksComponent],
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.css'
})
export class FaqsComponent {
  generalFaqs = [
    {
      question: 'How long is the rental period?',
      answer: `The rental period is ${RESERVATION_LENGTH} days, giving you plenty of time for pickup, use during your event, and return without stress.`,
      open: false
    },
    {
      question: 'Is there a minimum order amount for rentals?',
      answer: `While we work hard to keep our prices affordable, we do require a minimum rental order of $${MINIMUM_ORDER} to make each order worthwhile. Thank you for understanding and supporting small businesses like ours!`,
      open: false
    },
    {
      question: 'What should I do if I need to change my reservation?',
      answer: `We’re happy to accommodate changes whenever possible! Just send us a message - ${EMAIL} - with the updates you would like to make, and we will do our best to adjust your reservation.`,
      open: false
    }
  ];

  customFaqs = [
    {
      question: 'Do you offer custom signage for purchase as well as rental?',
      answer: 'At this time, we offer custom signage for rental only. We do not offer custom signs for purchase.',
      open: false
    },
    {
      question: 'Can I customize the signage to match my event theme or colors?',
      answer: 'Yes! We’re happy to customize signage to match your event’s theme and colors. After you book, we’ll reach out to learn about your vision — we offer a variety of color options for wording and designs. You can also check out our Inspiration page to see what others have created!',
      open: false
    },
    {
      question: 'What if I want a custom sign but don’t know where to start with the design?',
      answer: 'No problem! We’re happy to work with you. If design isn’t your thing, just let us know! We’ll take the reins and create mockups for your approval, making sure the design matches your vision perfectly.',
      open: false
    }
  ];

  policyFaqs = [
    {
      question: 'What is your cancellation or refund policy?',
      answer: 'Cancellations are accepted up to two weeks prior to your event. For cancellations within two weeks of the event date, refunds are handled on a case-by-case basis. This may depend on whether the reservation prevented another booking or if customization work has already been started.',
      open: false
    },
    {
      question: 'What is the payment schedule and what fees should I expect?',
      answer: 'We collect payment information at checkout, but you won’t be charged until 60 days before your event. The day before pickup, we will place a hold on your card for the deposit amount. This deposit is only collected if items are not returned in good condition.',
      open: false
    },
    {
      question: 'What happens if an item is damaged during my event?',
      answer: 'If an item is damaged during your event, the deposit hold on your card will be collected. We only charge the amount necessary to cover the cost of repair or replacement — nothing more. If something does break, please let us know as soon as possible! Early notice can often help us repair the item quickly and keep your deposit charge as low as possible.',
      open: false
    }
  ];

  toggleAnswer(list: any[], index: number) {
  // Close all questions in OTHER lists
  if (list !== this.generalFaqs) this.generalFaqs.forEach(faq => faq.open = false);
  if (list !== this.customFaqs) this.customFaqs.forEach(faq => faq.open = false);
  if (list !== this.policyFaqs) this.policyFaqs.forEach(faq => faq.open = false);
  
  // Close all other FAQs in the current list
  list.forEach((faq, i) => {
    if (i !== index) faq.open = false;
  });
  
  // Toggle only the clicked FAQ
  list[index].open = !list[index].open;
}

}
