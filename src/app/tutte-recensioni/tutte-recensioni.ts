import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-tutte-recensioni',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutte-recensioni.html',
  styleUrls: ['./tutte-recensioni.css'],
})
export class TutteRecensioni implements OnInit {
  isLoggedIn = false;
  recensioni$!: Observable<any[]>;
  filtro: string = 'data_desc';
  totaleRecensioni: number = 0;
  mediaPunteggio: number = 0;

  constructor(
    private firestore: Firestore,
    @Inject(Router) private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        this.caricaRecensioni();
      } else {
        this.recensioni$ = undefined!;
        this.totaleRecensioni = 0;
        this.mediaPunteggio = 0;
      }
    });
  }

  caricaRecensioni() {
    let ordinaPer =
      this.filtro === 'punteggio'
        ? orderBy('rating', 'desc')
        : orderBy('createdAt', 'desc');
    const recensioniRef = collection(this.firestore, 'recensioni');
    const q = query(recensioniRef, ordinaPer);
    this.recensioni$ = collectionData(q, { idField: 'id' });

    // Function che conta le recensioni e recupera la media punteggio
    this.recensioni$.subscribe((recensioni) => {
      //Calcolo il numero di recensioni
      this.totaleRecensioni = recensioni.length;
      //Calcola la media punteggio
      if (recensioni.length > 0) {
        const somma = recensioni.reduce((acc, r) => acc + r.rating, 0);
        this.mediaPunteggio = somma / recensioni.length;
      } else {
        this.mediaPunteggio = 0;
      }
    });
  }

  cambiaFiltro(nuovoFiltro: string) {
    this.filtro = nuovoFiltro;
    this.caricaRecensioni();
  }

  tempoTrascorso(timestamp: Timestamp): string {
    const now = new Date();
    const data = timestamp.toDate();
    const diffMs = now.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin} min fa`;
    const diffOre = Math.floor(diffMin / 60);
    if (diffOre < 24) return `${diffOre} ore fa`;
    const diffGiorni = Math.floor(diffOre / 24);
    return `${diffGiorni} giorni fa`;
  }

  vaiAlleRecensioni() {
    this.router.navigate(['/recensioni']);
  }
}
