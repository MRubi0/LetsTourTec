import { Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent {
  ngOnInit(){
  }
  ngAfterViewInit() {
    const map = L.map('map').setView([51.505, -0.09], 13);
    navigator.geolocation.getCurrentPosition((position) => {
      const latitud = String(position.coords.latitude);
      const longitud = String(position.coords.longitude);

      console.log('latitud ', latitud, 'longitud ', longitud);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
  
      const control = L.Routing.control({
        waypoints: [
          L.latLng(Number(latitud), Number(longitud)), 
          L.latLng(51.51, -0.1),
        ],
        routeWhileDragging: true
      }).addTo(map);
  
      control.on('routesfound', function (e) {
        const routes = e.routes;
        console.log(routes);
      });

    });
  }
}
