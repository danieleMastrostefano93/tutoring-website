import { Component, OnInit } from '@angular/core';
import { ContentCard } from '../content-card/content-card';
import { HeroBox } from '../hero-box/hero-box';
import { FilterBar } from '../filter-bar/filter-bar';
import { PromoBanner } from '../promo-banner/promo-banner';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-material-page',
  standalone: true,
  imports: [
    ContentCard,
    HeroBox,
    FilterBar,
    PromoBanner,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './material-page.html',
  styleUrl: './material-page.css',
})
export class MaterialPage implements OnInit {
  isLoggedIn = false;

  featuredLesson = {
    title: "Come affrontare un'espressione complessa",
    duration: '5 min',
    videoUrl: 'assets/MathTestVideo.mp4',
  };

  tuttiIContenuti: any[] = [];
  contenutiFiltrati: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.http.get<any[]>('assets/contenuti.json').subscribe((data) => {
      this.tuttiIContenuti = data;
      this.contenutiFiltrati = data;
    });

    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  aggiornaContenuti(filtrati: any[]) {
    this.contenutiFiltrati = filtrati;
  }
}
