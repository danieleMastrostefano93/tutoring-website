import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingCard } from '../pricing-card/pricing-card';
import { OfferCarousel } from '../offer-carousel/offer-carousel';
import { Faq } from '../faq/faq';

@Component({
  selector: 'app-prezzi',
  standalone: true,
  imports: [CommonModule, PricingCard, OfferCarousel, Faq],
  templateUrl: './prezzi.html',
  styleUrl: './prezzi.css',
})
export class Prezzi {
  plans = [
    {
      name: 'Base',
      price: '€29',
      description: 'Ideale per chi inizia',
      features: [
        '2 ore di tutoraggio',
        'Supporto via email',
        'Accesso alla piattaforma',
      ],
    },
    {
      name: 'Avanzato',
      price: '€59',
      description: 'Per chi vuole migliorare',
      features: [
        '5 ore di tutoraggio',
        'Supporto via chat',
        'Materiale personalizzato',
      ],
    },
    {
      name: 'Premium',
      price: '€99',
      description: 'Massima flessibilità e supporto',
      features: [
        '10 ore di tutoraggio',
        'Supporto 24/7',
        'Sessioni registrate',
      ],
    },
  ];

  specialOffers = [
    {
      title: 'Sconto Estate 20%',
      description: 'Valido fino al 31 luglio',
      iconClass: 'fas fa-fire',
    },
    {
      title: 'Porta un amico',
      description: 'Entrambi ricevete 1 ora gratis',
      iconClass: 'fas fa-users',
    },
  ];

  faqList = [
    {
      question: 'Posso cambiare piano in seguito?',
      answer: 'Sì, puoi cambiare piano in qualsiasi momento.',
    },
    {
      question: 'Come funziona il pagamento?',
      answer: 'Accettiamo carte, PayPal e bonifico.',
    },
    {
      question: 'Cosa succede se cancello una lezione?',
      answer: 'Puoi riprogrammarla senza costi aggiuntivi.',
    },
  ];
}
