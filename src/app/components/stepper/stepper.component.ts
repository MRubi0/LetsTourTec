import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConnectableObservable } from 'rxjs';
import { StepService } from 'src/app/services/step.service';
import { environment } from 'src/enviroment/enviroment';
import * as L from 'leaflet';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
  
  lat:number=0;
  long:number=0;
  tour:any;
  maps='maps';
  url=environment.bucket;

  constructor(private _formBuilder: FormBuilder, private stepService:StepService) {}

  ngOnInit(){
    this.firstFormGroup.valueChanges.subscribe(data=>{
      console.log(data);
    });
  }
  ngAfterViewInit(){
    this.data();
  }
  event() {
    const map = L.map(this.maps).setView([51.505, -0.09], 13);
    navigator.geolocation.getCurrentPosition((position) => {
      const latitud = String(position.coords.latitude);
      const longitud = String(position.coords.longitude);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
  
      const control = L.Routing.control({
        waypoints: [
          L.latLng(Number(latitud), Number(longitud)),
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
  
  load(lat:number, long:number, i:number): void {
    this.maps='maps'+i;
    this.lat = lat;
    this.long = long;
    this.event();
  }
  data(){
    this.stepService.getTourDetail('78').subscribe((data=>{
      this.tour=data;      
    }));
  }

  steps(){
    console.log(' paso ');
    //this.firstFormGroup.get('firstCtrl')?.setValue('r');
  }
}