import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);

  isLoggedIn$ = this.loggedIn.asObservable();

  currentUser: User | null = null;

  constructor(private auth: Auth, private firestore: Firestore) {
    // Controlla lo stato di login all'avvio
    onAuthStateChanged(this.auth, (user) => {
      this.loggedIn.next(!!user);
    });
  }

  async register(
    email: string,
    password: string,
    extraData: { nome: string; cognome: string; telefono: string }
  ) {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    await setDoc(doc(this.firestore, 'users', uid), {
      email,
      nome: extraData.nome,
      cognome: extraData.cognome,
      telefono: extraData.telefono,
      createdAt: new Date(),
    });

    this.loggedIn.next(true);
    return userCredential.user;
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    this.loggedIn.next(true);
    return userCredential.user;
  }

  logout() {
    this.loggedIn.next(false);
    this.auth.signOut();
    // `onAuthStateChanged` aggiornerà automaticamente `isLoggedIn`
  }
}
