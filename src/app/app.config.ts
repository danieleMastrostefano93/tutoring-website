import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  InMemoryScrollingOptions,
  InMemoryScrollingFeature,
  withInMemoryScrolling,
} from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { initializeApp } from 'firebase/app';
//import { getAnalytics } from 'firebase/analytics';
//import { provideAnalytics } from '@angular/fire/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDiLTBHpJoap4kutv8IY1Mm6z2xKWzM5wo',
  authDomain: 'tutor-website-717e5.firebaseapp.com',
  projectId: 'tutor-website-717e5',
  storageBucket: 'tutor-website-717e5.firebasestorage.app',
  messagingSenderId: '870834974460',
  appId: '1:870834974460:web:bce395908569695b33b179',
  measurementId: 'G-1C9E7ZV81J',
};

//To enable restoration of scrolling to the top of page - angular by default leave scrolling position the same when changing components through router
const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};
const inMemoryScrollingFeature: InMemoryScrollingFeature =
  withInMemoryScrolling(scrollConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, inMemoryScrollingFeature),
    provideClientHydration(withEventReplay()),

    importProvidersFrom(OverlayModule), // solo moduli qui

    provideFirebaseApp(() => {
      const app = initializeApp(firebaseConfig);
      // TODO: getAnalytics(app); // viene chiamato dentro provideFirebaseApp per inizializzare Analytics subito dopo Firebase; Analytics non funziona su localhost senza HTTPS
      return app;
    }),
    provideFirestore(() => getFirestore()),
    // TODO: provideAnalytics(() => getAnalytics()), //serve per poter usare inject(Analytics) nei tuoi componenti o servizi standalone
  ],
};
