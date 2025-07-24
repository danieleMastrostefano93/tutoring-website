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
      name: 'Basic',
      price: '€25',
      description: 'Lezione singola, ideale per chi inizia:',
      features: ['1 ora di tutoraggio'],
    },
    {
      name: 'Standard',
      price: '€112,5',
      description: 'Più lezioni, per chi vuole migliorare e più supporto:',
      features: ['Sconto del 10%', '5 ore di tutoraggio', 'Supporto via email'],
    },
    {
      name: 'Premium',
      price: '€200',
      description:
        'Pacchetto completo, per chi vuole massimi risultati e supporto:',
      features: [
        'Sconto del 20%',
        '10 ore di tutoraggio',
        'Supporto via email',
        'Accesso a materiale personalizzato',
      ],
    },
  ];

  specialOffers = [
    {
      title: 'Sconto Estate',
      description: 'Valido fino al 31 Settembre',
      iconClass: 'fa-solid fa-umbrella-beach',
      badge: '-10%',
    },
    {
      title: 'Porta un Amico',
      description: 'Entrambi ricevete 1 ora gratis',
      iconClass: 'fas fa-users',
      badge: '-50%',
    },
  ];

  faqList = [
    {
      question: 'Posso cambiare piano in seguito?',
      answer:
        'Certo, puoi cambiarlo quando vuoi. Le nuove tariffe si applicheranno da quel momento in poi.',
    },
    {
      question: 'Come funziona il pagamento?',
      answer: 'Può essere effettuato tramite bonifico istantaneo o PayPal.',
    },
    {
      question: 'Quando avviene il pagamento?',
      answer: "Deve essere effettuato all'inizio della lezione.",
    },
    {
      question: 'Cosa succede se cancello una lezione?',
      answer: 'Nessun problema! Puoi riprogrammarla quando vuoi ;).',
    },
  ];
}
