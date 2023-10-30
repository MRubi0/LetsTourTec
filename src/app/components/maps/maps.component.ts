import { Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine';
import { Observable } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent {

  $coordinates!:any;
  lat:number=0;
  long:number=0;

  constructor(private sharedService:SharedService){
    this.$coordinates=this.sharedService.getCoordinates;
  }

  ngOnInit(){

    this.$coordinates.subscribe((data:any)=>{
      this.load(data);
    });
    
  }
  ngAfterViewInit() {
    const map = L.map('map').setView([51.505, -0.09], 13);
    navigator.geolocation.getCurrentPosition((position) => {
      const latitud = String(position.coords.latitude);
      const longitud = String(position.coords.longitude);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
  
      const control = L.Routing.control({
        waypoints: [
          L.latLng(Number(latitud), Number(longitud)), 
          L.latLng(this.lat, this.long),
        ],
        routeWhileDragging: true
      }).addTo(map);
  
      control.on('routesfound', function (e) {
        const routes = e.routes;
        console.log(routes);
      });

    });
  }

  load(coordenadas:any){
    this.lat=coordenadas.latitude;
    this.long=coordenadas.longitude;
    console.log('this.lat ', this.lat);
    console.log('this.long ', this.long);
  }

}
