import { Routes } from '@angular/router';
import { Home } from './home/home';
import { MaterialPage } from './material-page/material-page';
import { Prezzi } from './prezzi/prezzi';
import { ReviewForm } from '../app/review-form/review-form';
import { Contatti } from './contatti/contatti';
import { Info } from './info/info';
import { TutteRecensioni } from './tutte-recensioni/tutte-recensioni';
import { Auth } from './auth/auth';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    data: {
      description: 'Lezioni private online con Daniele Mastrostefano: oltre 15 anni di esperienza e percorsi personalizzati per sviluppare ragionamento e autonomia nello studio.',
    },
  },
  { path: 'materiale', component: MaterialPage },
  {
    path: 'prezzi',
    component: Prezzi,
    data: {
      description: 'Scopri le tariffe di TutorOnline: lezione singola e pacchetti da 5 o 10 ore di tutoraggio, offerte speciali e risposte alle domande sui pagamenti e sulle lezioni.',
    },
  },
  { path: 'recensioni', component: ReviewForm },
  {
    path: 'contatti',
    component: Contatti,
    data: {
      description: 'Contatta Daniele Mastrostefano per maggiori informazioni sul servizio di tutoraggio: invia un messaggio compilando il modulo di contatto.',
    },
  },
  {
    path: 'info',
    component: Info,
    data: {
      description: 'Conosci Daniele Mastrostefano: dottore di ricerca in matematica e ingegnere informatico, con oltre 15 anni di tutoraggio in matematica, fisica e informatica.',
    },
  },
  { path: 'tutte-recensioni', component: TutteRecensioni },
  { path: 'auth', component: Auth },
];
