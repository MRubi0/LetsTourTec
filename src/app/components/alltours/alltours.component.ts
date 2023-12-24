import { Component } from '@angular/core';
import { LatestToursService } from 'src/app/services/latest-tours.service';
import { environment } from 'src/enviroment/enviroment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-alltours',
  templateUrl: './alltours.component.html',
  styleUrls: ['./alltours.component.scss']
})
export class AlltoursComponent {

  alltours:any;
  constructor(private latestToursService:LatestToursService, private http: HttpClient){

  }

  ngOnInit(){
    this.latestToursService.getAllTours().subscribe((data=>{
      this.alltours=data;
    }));
  }

  sortByDistance() {
    this.getCoordenades();
  }

  getCoordenades() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitud = String(position.coords.latitude);
        const longitud = String(position.coords.longitude);
        this.http.get(`${environment.apiUrl}get_nearest_tours_all`, {
          params: {latitude: latitud , longitude: longitud}})


          .subscribe((data: any) => {
            this.alltours = data;  
          });
      });
    } else {
      console.log("Geolocalización no es compatible en este navegador.");
    }
  }

}
