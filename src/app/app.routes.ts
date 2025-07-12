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
  { path: '', component: Home },
  { path: 'materiale', component: MaterialPage },
  { path: 'prezzi', component: Prezzi },
  { path: 'recensioni', component: ReviewForm },
  { path: 'contatti', component: Contatti },
  { path: 'info', component: Info },
  { path: 'tutte-recensioni', component: TutteRecensioni },
  { path: 'auth', component: Auth },
];
