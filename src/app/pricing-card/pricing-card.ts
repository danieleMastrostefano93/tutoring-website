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

  getClass(planName: string): string {
    switch (planName.toLowerCase()) {
      case 'basic':
        return 'plan-basic';
      case 'standard':
        return 'plan-standard';
      case 'premium':
        return 'plan-premium';
      default:
        return '';
    }
  }
}
