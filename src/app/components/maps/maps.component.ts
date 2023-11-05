import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Observable } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent {

  lat:number=0;
  long:number=0;

  constructor(private activatedRoute:ActivatedRoute){
  }

  ngOnInit(){
    this.activatedRoute.params.subscribe((params:any)=>{
      this.load(params);
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
          L.latLng(Number(latitud), Number(longitud)),//punto 1 
          L.latLng(this.lat, this.long)      
        ],
        routeWhileDragging: true,
        collapsible: false, 
        show: true,  
        addWaypoints: false,       
      }).addTo(map);
      
      control.on('waypointschanged', (e: any) => {
        e.waypoints.forEach((waypoint: any) => {
          waypoint.dragging.disable();
        });
      });

      control.on('routesfound', function (e) {
        const routes = e.routes;
        console.log(routes);
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            
            layer.dragging?.disable();
            
            const element = layer.getElement();
            if (element) {
              L.DomUtil.removeClass(element, 'leaflet-marker-draggable');
              L.DomUtil.removeClass(element, 'leaflet-interactive');
            }
          }
        });
      });

      setTimeout(() => {
        const routingContainer = document.querySelector('.leaflet-routing-container');
        const mapContainer = document.getElementById('map');
        if (routingContainer && mapContainer && mapContainer.parentElement) {
            mapContainer.parentElement.appendChild(routingContainer);
        }
    }, 0  );
    });
  }
  stopEvent(e: MouseEvent): void {
    console.log(e);
    e.stopImmediatePropagation();
    e.stopPropagation();
  }
  
  load(coordenadas: any): void {    
    this.lat = coordenadas.lat;
    this.long = coordenadas.long;
  }
}