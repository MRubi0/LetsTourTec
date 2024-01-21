import { AfterViewChecked, Component } from '@angular/core';
import { LatestToursService } from 'src/app/services/latest-tours.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {
  title: string = 'CARDS.Closest_tours';
  button1Text: string = 'CARDS.Show_last_tours'; 
  button2Text: string = 'CARDS.Update_location'; 
  button3Text: string = 'CARDS.Show_random_tours';


  lastTours: any;

  constructor(private latestToursService: LatestToursService) {

  }
  ngOnInit() {
    this.getCoordenades();
  }

  lastToursF() {
    this.latestToursService.getLastestTours().subscribe((data: any) => {
      this.lastTours = data;
    this.title = 'CARDS.Last_tours_uploaded';
    this.button1Text = 'CARDS.Update_tours';
    this.button2Text = "CARDS.Show_closest_tours";
    this.button3Text = 'CARDS.Show_random_tours';
    });
  }
  randomToursF() {
    this.latestToursService.getRadomTours().subscribe((data: any) => {
      this.lastTours = data;
    this.title = 'Random tours';
    this.button1Text = 'CARDS.Show_last_tours';
    this.button2Text = "CARDS.Show_closest_tours";
    this.button3Text = 'CARDS.Show_random_tours';
    });
  }
  closestToursF() {
    this.getCoordenades();
    this.title = 'CARDS.Closest_tours';
    this.button1Text = 'CARDS.Show_last_tours';
    this.button2Text = 'CARDS.Update_location';
    this.button3Text = 'CARDS.Show_random_tours';
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
