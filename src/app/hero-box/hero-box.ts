import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-box.html',
  styleUrl: './hero-box.css',
})
export class HeroBox {
  @Input() lesson: any;
  showPlayer = false;
  duration: string = '';

  updateDuration(video: HTMLVideoElement) {
    const minutes = Math.floor(video.duration / 60);
    const seconds = Math.floor(video.duration % 60);
    this.duration = `${minutes}m ${seconds}s`; // questa è una stringa assegnata alla variabile;
  }
}
