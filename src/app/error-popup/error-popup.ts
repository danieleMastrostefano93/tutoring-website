import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-popup.html',
  styleUrl: './error-popup.css',
})
export class ErrorPopup {
  @Input() message: string = '';
}
