import { AfterViewChecked, Component } from '@angular/core';
import { LatestToursService } from 'src/app/services/latest-tours.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {
  title: string = 'Closest tours'; // valor inicial
  button1Text: string = 'Show last tours'; // valor inicial
  button2Text: string = 'Update location'; // valor inicial
  button3Text: string = 'Show random tours'; // valor inicial


  lastTours: any;

  constructor(private latestToursService: LatestToursService) {

  }
  ngOnInit() {
    this.getCoordenades();
  }

  lastToursF() {
    this.latestToursService.getLastestTours().subscribe((data: any) => {
      this.lastTours = data;
    this.title = 'Last Tours uploaded';
    this.button1Text = 'Update tours';
    this.button2Text = 'Show closest tours';
    this.button3Text = 'Show random tours';
    });
  }
  randomToursF() {
    this.latestToursService.getRadomTours().subscribe((data: any) => {
      this.lastTours = data;
    this.title = 'Random Tours';
    this.button1Text = 'Show last tours';
    this.button2Text = 'Show closest tours';
    this.button3Text = 'Show random tours';
    });
  }
  closestToursF() {
    this.getCoordenades();
    this.title = 'Closest Tours';
    this.button1Text = 'Show last tours';
    this.button2Text = 'Update location';
    this.button3Text = 'Show random tours';
  }
  

  getCoordenades() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitud = String(position.coords.latitude);
        const longitud = String(position.coords.longitude);

        this.latestToursService.getClosestTours(latitud, longitud)
          .subscribe((data: any) => {
            this.lastTours = data;
          });
      });
    } else {
      console.log("Geolocalización no es compatible en este navegador.");
    }
  }

}
