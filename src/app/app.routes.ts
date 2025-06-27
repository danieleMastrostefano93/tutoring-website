import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Materiale } from './materiale/materiale';
import { Prezzi } from './prezzi/prezzi';
import { Recensioni } from './recensioni/recensioni';
import { Contatti } from './contatti/contatti';
import { Info } from './info/info';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'materiale', component: Materiale },
  { path: 'prezzi', component: Prezzi },
  { path: 'recensioni', component: Recensioni },
  { path: 'contatti', component: Contatti },
  { path: 'info', component: Info },
];
