import { Component, OnInit } from '@angular/core';
import { LatestToursService } from 'src/app/services/latest-tours.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  title: string = 'CARDS.Closest_tours';
  button1Text: string = 'CARDS.Show_last_tours';
  button2Text: string = 'CARDS.Update_location';

  lastTours: any;
  allTours: any[] = [];
  isLoading: boolean = false;
  geoErrorMessage: string | null = null;
  activeType: string | null = null;

  private userLat: string | null = null;
  private userLon: string | null = null;

  constructor(private latestToursService: LatestToursService) {}

  ngOnInit() {
    this.getCoordenades();
  }

  lastToursF() {
    this.activeType = null;
    this.isLoading = true;
    this.geoErrorMessage = null;

    this.latestToursService.getLastestTours().subscribe({
      next: (data: any) => {
        this.allTours = data;
        this.lastTours = [...data];
        this.title = 'CARDS.Last_tours_uploaded';
        this.button1Text = 'CARDS.Update_tours';
        this.button2Text = 'CARDS.Show_closest_tours';
      },
      error: (err) => {
        console.error('Error getting last tours', err);
        // Aquí podrías añadir un mensaje de error general si quieres
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  filterByType(tipo: string) {
    if (this.activeType === tipo) {
      this.activeType = null;
      this.lastTours = [...this.allTours];
      return;
    }
    this.activeType = tipo;

    // Si tenemos coordenadas del usuario, pedir al backend todos los tours del tipo ordenados por distancia
    if (this.userLat && this.userLon) {
      this.isLoading = true;
      this.latestToursService.getClosestToursByType(this.userLat, this.userLon, tipo).subscribe({
        next: (data: any) => {
          this.lastTours = data;
        },
        error: (err) => {
          console.error('Error getting tours by type', err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Fallback client-side si no hay coordenadas (modo "últimos tours")
      this.lastTours = this.allTours.filter(t => t.tipo_de_tour === tipo);
    }
  }

  closestToursF() {
    this.activeType = null;
    this.title = 'CARDS.Closest_tours';
    this.button1Text = 'CARDS.Show_last_tours';
    this.button2Text = 'CARDS.Update_location';

    this.getCoordenades();
  }

  getCoordenades() {
    this.geoErrorMessage = null;

    if (!('geolocation' in navigator)) {
      this.geoErrorMessage = 'CARDS.Geolocation_not_supported'; // o texto plano
      console.log('Geolocalización no es compatible en este navegador.');
      return;
    }

    this.isLoading = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitud = String(position.coords.latitude);
        const longitud = String(position.coords.longitude);
        this.userLat = latitud;
        this.userLon = longitud;

        this.latestToursService.getClosestTours(latitud, longitud).subscribe({
          next: (data: any) => {
            this.allTours = data;
            this.lastTours = [...data];
          },
          error: (err) => {
            console.error('Error getting closest tours', err);
            this.geoErrorMessage = 'CARDS.Error_getting_closest_tours';
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      },
      (error) => {
        this.isLoading = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.geoErrorMessage = 'CARDS.Geolocation_permission_denied';
            break;
          case error.POSITION_UNAVAILABLE:
            this.geoErrorMessage = 'CARDS.Geolocation_unavailable';
            break;
          case error.TIMEOUT:
            this.geoErrorMessage = 'CARDS.Geolocation_timeout';
            break;
          default:
            this.geoErrorMessage = 'CARDS.Geolocation_unknown_error';
        }

        console.error('Geolocation error', error);
      },
      {
        timeout: 10000
      }
    );
  }
}
