import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { NgZone } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-review-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.html',
  styleUrls: ['./review-form.css'],
})
export class ReviewForm {
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
        setTimeout(() => {
          this.ngZone.run(() => {
            this.submitted = true;
          });
        }, 0);
      } catch (error) {
        console.error('Errore nel salvataggio:', error);
      }
    }
  }
}
