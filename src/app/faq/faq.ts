import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {
  @Input() questions!: { question: string; answer: string }[];
  openIndex: number | null = null;

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
