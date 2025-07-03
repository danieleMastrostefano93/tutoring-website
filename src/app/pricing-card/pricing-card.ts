import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pricing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing-card.html',
  styleUrl: './pricing-card.css',
})
export class PricingCard {
  @Input() plan!: {
    name: string;
    price: string;
    description: string;
    features: string[];
  };
}
