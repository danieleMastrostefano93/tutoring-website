import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  increment,
} from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-card.html',
  styleUrl: './content-card.css',
})
export class ContentCard implements OnInit {
  @Input() content: any;

  upvotes = 0;
  downvotes = 0;
  views = 0;
  videoInRiproduzione: string | null = null;

  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);

  async ngOnInit() {
    if (this.content?.id) {
      const contentRef = doc(this.firestore, 'contenuti', this.content.id);
      const contentSnap = await getDoc(contentRef);

      if (contentSnap.exists()) {
        const data = contentSnap.data();
        this.views = data['views'] || 0;
      }
    }
  }

  async playVideo(url: string, contentId: string) {
    this.videoInRiproduzione = url;

    const user = this.auth.currentUser;
    if (!user) {
      console.warn('Utente non autenticato');
      return;
    }

    const viewDocRef = doc(
      this.firestore,
      `contenuti/${contentId}/visualizzazioni/${user.uid}`
    );
    const viewDocSnap = await getDoc(viewDocRef);

    if (!viewDocSnap.exists()) {
      // Aggiungi il documento nella sottocollezione
      await setDoc(viewDocRef, { visto: true });

      // Incrementa il contatore globale
      const contentRef = doc(this.firestore, 'contenuti', contentId);
      await setDoc(contentRef, { views: increment(1) }, { merge: true });

      this.views++;
    }
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
}
