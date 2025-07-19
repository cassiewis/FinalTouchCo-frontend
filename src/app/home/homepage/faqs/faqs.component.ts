import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HowItWorksComponent } from '../how-it-works/how-it-works.component';
import { EMAIL, RESERVATION_LENGTH, MINIMUM_ORDER, PAYMENT_DUE_DAYS } from '../../../shared/constants';

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
      question: 'Is there a minimum order amount?',
      answer: `Yes — we have a minimum rental order of $${MINIMUM_ORDER}. This helps ensure each order is sustainable for a small business. Thank you so much for supporting us!`,
      open: false
    },
    {
      question: 'Can I make changes to my reservation?',
      answer: `Absolutely! If you need to adjust your rental items or details, email us at ${EMAIL}. We’ll do our best to accommodate any updates you need to make.`,
      open: false
    }
    ,
    {
      question: 'Do you offer delivery or pickup services?',
      answer: `Yes! We offer delivery and pickup options on a case-by-case basis, depending upon availability and distance. Additional fees apply. If you're interested, just leave a note at checkout or reach out to us directly — we'll follow up with a custom quote.`,
      open: false
    }
  ];

  customFaqs = [
    {
      question: 'How much customization can I make on signs?',
      answer: `Each item is different! Some signs offer just a few customizable details, while others can be fully tailored to your event. You can find exactly what's customizable in the details section on each product page`,
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
      answer: `You can cancel your order for a full refund up to ${PAYMENT_DUE_DAYS} days before your pickup date. For cancellations within 30 days, refunds are handled on a case-by-case basis, depending on whether work has started or if your booking blocked out other reservations.`,
      open: false
    },
    {
      question: 'When do I pay, and are there any extra fees?',
      answer: `You’ll enter your booking details at checkout, but payment isn’t due until ${PAYMENT_DUE_DAYS} days before your pickup date. There are no deposits, hidden fees, or surprise charges — just the rental price shown on each product page.`,
      open: false
    },
    {
      question: 'What happens if an item is damaged during my event?',
      answer: 'If any item is damaged during your rental period, you’re responsible for the cost of repair or replacement. Charges depend on the extent of the damage and will never exceed the item’s maximum replacement value, listed in the “Pickup and Return” section of each product page. If something happens, please let us know as soon as possible — early notice often helps minimize the cost.',
      open: false
    }
  ];

  toggleAnswer(list: any[], index: number) {
    // close all questions in OTHER lists
    if (list !== this.generalFaqs) this.generalFaqs.forEach(faq => faq.open = false);
    if (list !== this.customFaqs)  this.customFaqs.forEach(faq => faq.open = false);
    if (list !== this.policyFaqs)  this.policyFaqs.forEach(faq => faq.open = false);
    // Toggle the clicked FAQ (open it if it's closed, close it if it's already open)
    // if the question is closed, close everythnig in the list
    if (!list[index].open) {
      list.forEach(faq => faq.open = false);
    }
    // Toggle the clicked FAQ
    list[index].open = !list[index].open;
  }

}
