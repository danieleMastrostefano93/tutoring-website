import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promo-banner.html',
  styleUrl: './promo-banner.css',
})
export class PromoBanner {}
