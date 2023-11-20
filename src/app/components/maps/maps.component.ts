import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent {
  lat: number = 0;
  long: number = 0;
  private watchId: number | null = null;
  private control: L.Routing.Control | null = null;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.load(params);
    });
  }

  ngAfterViewInit() {
    const map = L.map('maps').setView([51.505, -0.09], 13);
    navigator.geolocation.getCurrentPosition((position) => {
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      this.control = L.Routing.control({
        waypoints: [
          L.latLng(latitud, longitud),
          L.latLng(this.lat, this.long)
        ],
        routeWhileDragging: true,
        collapsible: false, 
        show: true,  
        addWaypoints: false       
      }).addTo(map);

      this.control.on('waypointschanged', (e: any) => {
        e.waypoints.forEach((waypoint: any) => {
          //waypoint.dragging.disable();
        });
      });

      this.control.on('routesfound', (e) => {
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
      }, 0);
    });

    this.watchId = navigator.geolocation.watchPosition((position) => {
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;


      console.log(`Nueva posición del usuario: ${latitud}, ${longitud}`);

      
      if (this.control) {
        this.control.setWaypoints([
          L.latLng(latitud, longitud),
          L.latLng(this.lat, this.long)
        ]);
      }
    }, (error) => {
      console.error(error);
    }, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
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

  ngOnDestroy() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }
}
