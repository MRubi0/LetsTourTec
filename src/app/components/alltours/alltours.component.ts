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
    navigator.geolocation.getCurrentPosition((position) => {
      const latitud = String(position.coords.latitude);
      const longitud = String(position.coords.longitude);
      this.latestToursService.getAllTours(latitud, longitud).subscribe((data=>{
        this.alltours=data;
      }));
    })   
  }

  sortByDistance() {
    this.getCoordenades();
  }

  getCoordenades() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lang: string = localStorage.getItem('language') ?? 'es';
        const latitud = String(position.coords.latitude);
        const longitud = String(position.coords.longitude);
        console.log('latitud ',latitud, longitud)
        this.http.get(`${environment.apiUrl}`, {
          params: {latitude: latitud , longitude: longitud,language:lang}})


          .subscribe((data: any) => {
            this.alltours = data;  
          });
      });
    } else {
      console.log("Geolocalización no es compatible en este navegador.");
    }
  }

}
