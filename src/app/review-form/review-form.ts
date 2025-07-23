import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { NgZone } from '@angular/core';
import confetti from 'canvas-confetti';

@Component({
  standalone: true,
  selector: 'app-review-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.html',
  styleUrls: ['./review-form.css'],
})
export class ReviewForm implements OnDestroy {
  @ViewChild('confettiCanvas', { static: true })
  confettiCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  hoveredRating = 0;

  review = {
    name: '',
    rating: 0,
    comment: '',
  };

  submitted = false;

  confettiInstance: any;
  private animationFrameId: number | null = null;

  ngOnInit() {
    this.confettiInstance = confetti.create(this.confettiCanvas.nativeElement, {
      resize: true,
      useWorker: true,
    });
  }

  setHoveredRating(value: number) {
    this.hoveredRating = value;
  }

  clearHoveredRating() {
    this.hoveredRating = 0;
  }

  setRating(value: number) {
    this.review.rating = value;
  }

  async submitReview() {
    if (this.review.rating && this.review.comment.trim()) {
      try {
        const reviewsRef = collection(this.firestore, 'recensioni');

        const reviewWithTimestamp = {
          ...this.review,
          createdAt: serverTimestamp(),
        };

        await addDoc(reviewsRef, reviewWithTimestamp);

        // Forza Angular a rilevare il cambiamento nel prossimo ciclo
        this.ngZone.run(() => {
          this.submitted = true;
          this.cdr.detectChanges();
          this.launchConfetti();
        });
      } catch (error) {
        console.error('Errore nel salvataggio:', error);
      }
    }
  }

  launchConfetti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      this.confettiInstance({
        particleCount: 10,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      this.confettiInstance({
        particleCount: 10,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        this.animationFrameId = requestAnimationFrame(frame);
      }
    };
    this.animationFrameId = requestAnimationFrame(frame);
  }

  ngOnDestroy() {
    if (this.confettiInstance) {
      this.confettiInstance.reset(); // Ferma e pulisce il canvas
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
