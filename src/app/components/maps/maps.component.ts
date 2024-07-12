import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnDestroy, AfterViewInit {
  lat: number = 0;
  long: number = 0;
  private watchId: number | null = null;
  private control: L.Routing.Control | null = null;
  tour_id = 0;
  private locationUpdateInterval: any;
  private map!: L.Map;
  constructor(private activatedRoute: ActivatedRoute, private mapService: MapService) {}
  private isFirstLoad: boolean = true;


  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.load(params);
    });  
  }

  updateLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      const latitud = Number(position.coords.latitude);
      const longitud = Number(position.coords.longitude);
      this.mapService.createRoute(this.lat, this.long, longitud, latitud).subscribe((data: any) => {
        if (data[0].message || data[0].error) {
          this.alternative();
        } else {
          this.lat = data[0].paths[0].points.coordinates[0][1];
          this.long = data[0].paths[0].points.coordinates[0][0];
          this.displayRouteOnMap(data[0]);
        }
      }, (error) => {
        console.error('Error al crear la ruta:', error);
      });
    }, (error) => {
      console.error('Error al obtener la ubicación:', error);
    }, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    });
  }
  

  ngAfterViewInit() {
    // Inicializa la ubicación y luego actualiza cada 20 segundos
    this.updateLocation();
    this.locationUpdateInterval = setInterval(() => {
      this.updateLocation();
    }, 20000); // 20 segundos
  }

  stopEvent(e: MouseEvent): void {
    console.log(e);
    e.stopImmediatePropagation();
    e.stopPropagation();
  }

  load(coordenadas: any): void {    
    this.lat = coordenadas.lat;
    this.long = coordenadas.long;
    this.tour_id=coordenadas.id
  }

  ngOnDestroy() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }
  }

displayRouteOnMap(data: any): void {
  // Verifica si el mapa ya ha sido inicializado
  if (!this.map) {
    this.map = L.map('maps').setView([this.lat, this.long], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 25,
    }).addTo(this.map);
  }

  // Limpia rutas/marcadores existentes antes de añadir nuevos
  this.map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      this.map.removeLayer(layer);
    }
  });

  const coordinates = data.paths[0].points.coordinates.map((coord: any) => [coord[1], coord[0]]);
  const routeLine = L.polyline(coordinates, { color: 'blue' }).addTo(this.map);

  

  const standard = L.icon({
    iconUrl: '../../../assets/iconos/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const endIcon = L.icon({
    iconUrl: '../../../assets/iconos/finsh.png', 
    iconSize: [41, 41],
    iconAnchor: [20, 41], 
  });

  L.marker(coordinates[0], { icon: endIcon  }).addTo(this.map);
  L.marker(coordinates[coordinates.length - 1], { icon: standard }).addTo(this.map);

  if (this.isFirstLoad) {
    this.map.fitBounds(routeLine.getBounds(), { padding: [20, 20], maxZoom: 25 });
    this.isFirstLoad = false; 
  } else {
    let currentZoom = this.map.getZoom();
    let lastCoordinate = coordinates[coordinates.length - 1];
    this.map.setView(lastCoordinate, currentZoom);
  }
}
  

  alternative(){
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
        collapsible: true, 
        show: true,  
        addWaypoints: false       
      }).addTo(map);

      this.control.on('waypointschanged', (e: any) => {
        e.waypoints.forEach((waypoint: any) => {
        });
      });

      this.control.on('routesfound', (e) => {
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
      const standard = L.icon({
        iconUrl: '../../../assets/iconos/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }); 
      if (this.control) {
        L.marker([latitud, longitud],{ icon: standard }).addTo(map);
        L.marker([this.lat, this.long], { icon: standard }).addTo(map); 
        /*this.control.setWaypoints([
          L.latLng(latitud, longitud),
          L.latLng([this.lat, this.long], {icon: standard})
        ]);*/
      }
    }, (error) => {
      console.error(error);
    }, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    });    
  }
  
}