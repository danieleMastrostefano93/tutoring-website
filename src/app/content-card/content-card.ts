import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-card.html',
  styleUrl: './content-card.css',
})
export class ContentCard {
  @Input() content: any;
  upvotes = 0;
  downvotes = 0;
  views = 0;
  videoInRiproduzione: string | null = null;

  playVideo(url: string) {
    this.videoInRiproduzione = url;
  }

  chiudiVideo() {
    this.videoInRiproduzione = null;
  }

  leggiPost(content: any) {
    // Puoi aprire un modal, navigare a una pagina, ecc.
    console.log('Apri blog post:', content);
  }

  vote(type: 'up' | 'down') {
    if (type === 'up') this.upvotes++;
    else this.downvotes++;
  }

  incrementViews() {
    this.views++;
  }
}
