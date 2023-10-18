import { AfterViewChecked, Component } from '@angular/core';
import { LatestToursService } from 'src/app/services/latest-tours.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {

  lastTours: any;

  constructor(private latestToursService: LatestToursService) {

  }
  ngOnInit() {
    this.getCoordenades();
  }

  lastToursF() {
    this.latestToursService.getLastestTours().subscribe((data: any) => {
      this.lastTours = data;
    });
  }
  randomToursF() {
    this.latestToursService.getRadomTours().subscribe((data: any) => {
      this.lastTours = data;
    });
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
