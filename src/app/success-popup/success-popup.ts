import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuccessPopupService } from './success-popup.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-success-popup',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './success-popup.html',
  styleUrl: './success-popup.css',
})
export class SuccessPopup {
  @Input() message: string = '';
  showButton = false;

  constructor(private successPopupService: SuccessPopupService) {}

  ngOnInit() {
    this.successPopupService.showButton$.subscribe((value) => {
      this.showButton = value;
    });
  }
}
