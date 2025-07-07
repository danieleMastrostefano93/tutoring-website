import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  recensioni$!: Observable<Recensione[]>;
  mediaRating = 0;
  fullStars: number[] = [];
  emptyStars: number[] = [];
  hasHalfStar = false;
  halfStarPercentage = 0;

  constructor(private firestore: Firestore, private router: Router) {
    this.calculateStars();
  }

  calculateStars() {
    const full = Math.floor(this.mediaRating);
    const decimal = this.mediaRating - full;
    const empty = 5 - Math.ceil(this.mediaRating);

    this.fullStars = Array(full).fill(0);
    this.emptyStars = Array(empty).fill(0);
    this.hasHalfStar = decimal > 0 && decimal < 1;
    this.halfStarPercentage = Math.round(decimal * 100);
  }

  vaiAlleRecensioni() {
    this.router.navigate(['/tutte-recensioni']);
  }

  ngOnInit(): void {
    const recensioniCollection = collection(this.firestore, 'recensioni');
    this.recensioni$ = collectionData(recensioniCollection, {
      idField: 'id',
    }) as Observable<Recensione[]>;

    this.recensioni$.subscribe((recensioni) => {
      if (recensioni.length > 0) {
        const somma = recensioni.reduce((acc, r) => acc + r.rating, 0);
        this.mediaRating = somma / recensioni.length;
      }
    });
  }
}

interface Recensione {
  name: string;
  rating: number;
  comment: string;
}
