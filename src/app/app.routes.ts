import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Materiale } from './materiale/materiale';
import { Prezzi } from './prezzi/prezzi';
import { ReviewForm } from '../app/review-form/review-form';
import { Contatti } from './contatti/contatti';
import { Info } from './info/info';
import { TutteRecensioni } from './tutte-recensioni/tutte-recensioni';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'materiale', component: Materiale },
  { path: 'prezzi', component: Prezzi },
  { path: 'recensioni', component: ReviewForm },
  { path: 'contatti', component: Contatti },
  { path: 'info', component: Info },
  { path: 'tutte-recensioni', component: TutteRecensioni },
];
