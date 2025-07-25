import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar implements OnInit {
  @Output() contenutiFiltratiChange = new EventEmitter<any[]>();

  // Dati e selezioni
  categories = ['Formato', 'Video', 'Appunti'];
  subjects = ['Materia', 'Matematica', 'Fisica'];
  levels = [
    'Indirizzo',
    'Elementari',
    'Medie',
    'Superiori',
    'Università',
    'Altro',
  ];
  @Input() contenuti: any[] = []; // Caricati da JSON
  contenutiFiltrati: any[] = [];
  //Qui sotto i valori di Default
  selectedCategoria: string = 'Formato';
  selectedMateria: string = 'Materia';
  selectedLivello: string = 'Indirizzo';
  keyword: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('assets/contenuti.json').subscribe((data) => {
      this.contenuti = data;
      this.filtraContenuti(); // Filtro iniziale
    });
  }

  //filter è un metodo che crea un nuovo array contenente solo gli elementi che soddisfano la condizione specificata.
  //Per ogni contenuto c, viene incluso in contenutiFiltrati solo se o non è stata selezionata una categoria (!this.selectedCategoria)
  //oppure corrisponde (c.categoria === this.selectedCategoria); così via per gli altri
  filtraContenuti() {
    const chiave = this.keyword.toLowerCase().trim();

    this.contenutiFiltrati = this.contenuti.filter(
      (c) =>
        (this.selectedCategoria === 'Formato' ||
          c.categoria === this.selectedCategoria) &&
        (this.selectedMateria === 'Materia' ||
          c.materia === this.selectedMateria) &&
        (this.selectedLivello === 'Indirizzo' ||
          c.livello === this.selectedLivello) &&
        (!chiave || // se la keyword è vuota, ignora la ricerca testuale
          Object.values(c).some(
            (val) =>
              typeof val === 'string' && val.toLowerCase().includes(chiave)
          ))
    );
    this.contenutiFiltratiChange.emit(this.contenutiFiltrati);
  }

  onKeywordChange(val: string) {
    this.keyword = val;
  }
}
