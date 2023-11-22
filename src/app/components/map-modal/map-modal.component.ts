import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss']
})
export class MapModalComponent implements OnInit, OnDestroy {
  private map!: L.Map;
private control!: L.Routing.Control;
private watchId!: number;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MapModalComponent>
  ) { 
    console.log('Data received in MapModalComponent:', data);
  }

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  initializeMap(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      this.map = L.map('map').setView([userLat, userLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);

      this.control = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(this.data.latitude, this.data.longitude)
        ],
        routeWhileDragging: true,
        collapsible: true, 
        show: true,  
        addWaypoints: false, 
      }).addTo(this.map);

      this.control.on('routesfound', (e) => {
        const waypoints = e.waypoints;
        const startMarker = L.marker(e.waypoints[0].latLng, { draggable: false }).addTo(this.map);
  const endMarker = L.marker(e.waypoints[e.waypoints.length - 1].latLng, { draggable: false }).addTo(this.map);

        [startMarker, endMarker].forEach(marker => {
          marker.on('add', function() {
            const element = marker.getElement();
            if (element) {
              L.DomUtil.removeClass(element, 'leaflet-marker-draggable');
              L.DomUtil.removeClass(element, 'leaflet-interactive');
            }
          });
        });
      });

      // Configuración del seguimiento de posición del usuario
      this.watchId = navigator.geolocation.watchPosition((newPosition) => {
        const newLat = newPosition.coords.latitude;
        const newLng = newPosition.coords.longitude;

        // Actualizar la primera waypoint con la nueva posición del usuario
        if (this.control) {
          const newWaypoint = L.Routing.waypoint(L.latLng(newLat, newLng));
const waypoints = this.control.getWaypoints();
waypoints[0] = newWaypoint;
this.control.setWaypoints(waypoints);

        }
      }, (error) => {
        console.error(error);
      }, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      });

    }, (error) => {
      console.error('Error getting user position:', error);
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  }

  // Otros métodos del componente...
}
