import { Component, OnInit, Inject } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss']
})
export class MapModalComponent implements OnInit {
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MapModalComponent>
  ) { 
    console.log('Data received in MapModalComponent:', data);
  }

  ngOnInit(): void {
    this.initializeMap();
  }
  closeModal(): void {
    this.dialogRef.close();
  }

  initializeMap(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      console.log('Initializing map with user latitude:', userLat, 'and user longitude:', userLng);
      console.log('Destination latitude:', this.data.latitude, 'and longitude:', this.data.longitude);

      if (this.data.latitude != null && this.data.longitude != null) {
        const map = L.map('map').setView([userLat, userLng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);
  
        const control = L.Routing.control({
          waypoints: [
            L.latLng(userLat, userLng),
            L.latLng(this.data.latitude, this.data.longitude)
          ],
          routeWhileDragging: true,
        collapsible: true, 
        show: true,  
        addWaypoints: false, 
        }).addTo(map);
  
        control.on('routesfound', function(e) {
          
          const waypoints = e.waypoints;
          const startMarker = L.marker(waypoints[0].latLng, { draggable: false }).addTo(map);
          const endMarker = L.marker(waypoints[waypoints.length - 1].latLng, { draggable: false }).addTo(map);
          
          
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
      } else {
        console.log('Latitude or longitude is null');
      }
    });
  }
}