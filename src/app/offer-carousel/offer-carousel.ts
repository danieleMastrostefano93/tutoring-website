import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offer-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-carousel.html',
  styleUrl: './offer-carousel.css',
})
export class OfferCarousel {
  @Input() offers!: {
    title: string;
    description: string;
    iconClass: string;
    badge: string;
  }[];
}
