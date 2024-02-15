import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss']
})
export class MapModalComponent implements OnInit, OnDestroy {
  lat: number = 0;
  long: number = 0;
  private watchId: number | null = null;
  private control: L.Routing.Control | null = null;
  tour_id = 0;

  constructor(private activatedRoute: ActivatedRoute, private mapService:MapService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MapModalComponent>
    ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.load(params);
    });  
  }

  ngAfterViewInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      const latitud = Number(position.coords.latitude);
      const longitud = Number(position.coords.longitude);
      try {
        this.mapService.createRoute(this.data.latitude, this.data.longitude,longitud, latitud).subscribe((data: any) => {
        if(data.message){
         console.log(data.message); 
         this.alternative();
        }else{
          this.lat = data.paths[0].points.coordinates[0][1];
          this.long = data.paths[0].points.coordinates[0][0];
          this.displayRouteOnMap(data);
        }
        
      });
      } catch (routeError) {
        console.error('Error al crear la ruta:', routeError);
      }
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
    this.tour_id=coordenadas.id
  }

  ngOnDestroy() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  displayRouteOnMap(data: any): void {
    const map = L.map('mapa').setView([this.lat, this.long], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);
  
    const coordinates = data.paths[0].points.coordinates.map((coord:any) => [coord[1], coord[0]]);
    
    const routeLine = L.polyline(coordinates, { color: 'blue' }).addTo(map);
  
    const startMarker = L.marker(coordinates[0]).addTo(map);
    const endMarker = L.marker(coordinates[coordinates.length - 1]).addTo(map);
  
    const instructions = data.paths[0].instructions;
    instructions.forEach((instruction: any) => {
      console.log(instruction.text);
    });  
    map.fitBounds(routeLine.getBounds());
  }  
  alternative(){
    const map = L.map('mapa').setView([51.505, -0.09], 13);
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
    
  closeModal(): void {
    this.dialogRef.close();
  }  
}
