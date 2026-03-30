import { Component, OnInit } from '@angular/core';
import { LatestToursService } from 'src/app/services/latest-tours.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/enviroment/enviroment';

@Component({
  selector: 'app-alltours',
  templateUrl: './alltours.component.html',
  styleUrls: ['./alltours.component.scss']
})
export class AlltoursComponent implements OnInit {
  alltours: any;
  loading = true;
  geoError = false;
  sortedByDistance = false;

  constructor(
    private latestToursService: LatestToursService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.loading = true;
    this.geoError = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = String(position.coords.latitude);
        const lng = String(position.coords.longitude);
        this.latestToursService.getAllTours(lat, lng).subscribe({
          next: (data: any) => {
            this.alltours = data;
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      () => {
        // Geolocalización denegada o no disponible — cargamos igualmente sin coordenadas
        const lang = localStorage.getItem('language') ?? 'es';
        this.http.get(`${environment.apiUrl}get_nearest_tours_all/?page=1&latitude=40.4168&longitude=-3.7038&language=${lang}`)
          .subscribe({
            next: (data: any) => {
              this.alltours = data;
              this.geoError = true;
              this.loading = false;
            },
            error: () => { this.loading = false; }
          });
      }
    );
  }

  sortByDistance(): void {
    if (!('geolocation' in navigator)) return;
    this.loading = true;
    navigator.geolocation.getCurrentPosition((position) => {
      const lang = localStorage.getItem('language') ?? 'es';
      const lat = String(position.coords.latitude);
      const lng = String(position.coords.longitude);
      this.http.get(`${environment.apiUrl}get_nearest_tours_all`, {
        params: { latitude: lat, longitude: lng, language: lang }
      }).subscribe({
        next: (data: any) => {
          this.alltours = data;
          this.sortedByDistance = true;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    });
  }
}
