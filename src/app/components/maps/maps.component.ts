import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MapService } from 'src/app/services/map.service';

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
  tour_id = 0;

  constructor(private activatedRoute: ActivatedRoute, private mapService:MapService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.load(params);
    });  
  }

  ngAfterViewInit() {
    this.mapService.createRoute().subscribe((data: any) => {
      this.lat = data.paths[0].points.coordinates[0][1];
      this.long = data.paths[0].points.coordinates[0][0];
      this.displayRouteOnMap(data);
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
    const map = L.map('maps').setView([this.lat, this.long], 13);
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
}
