import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConnectableObservable } from 'rxjs';
import { StepService } from 'src/app/services/step.service';
import { environment } from 'src/enviroment/enviroment';
import * as L from 'leaflet';
import { MatDialog } from '@angular/material/dialog';
import { MapModalComponent } from 'src/app/components/map-modal/map-modal.component';
import { MatStepper } from '@angular/material/stepper';


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
  screenWidth: number = window.innerWidth;
  screenHeight: number = window.innerHeight;

  lat:number=0;
  long:number=0;
  tour:any;
  maps='maps';
  url=environment.bucket;

  @ViewChild(MatStepper) stepper!: MatStepper;


  constructor(private dialog: MatDialog, private _formBuilder: FormBuilder, private stepService:StepService) { }

  ngOnInit(){
    this.firstFormGroup = this._formBuilder.group({
      
      firstCtrl: ['', Validators.required]
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
  openMapModal(lat: number, lng: number): void {
    const dialogRef = this.dialog.open(MapModalComponent, {
      width: `${Math.min(this.screenWidth * 0.9, 800)}px`,
            maxWidth: 'none',
      data: { latitude: lat, longitude: lng }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  } 
  goToNextStep() {
    this.stepper.next();
  }

  goToPreviousStep() {
    this.stepper.previous(); 
  }
  musicAction(event:string){
    if(event=='next'){
      this.goToNextStep();
    }else{
      this.goToPreviousStep();
    }
  }
}

/* 
hay que añadir la forma de crear un registro al clicar en el boton de finalizar tour
ademas de crear ua pantalla de final
mansaje de chatgpt sobre como hacerlo
fetch('/create-tour-record/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Asegúrate de incluir el token CSRF si lo estás utilizando
    },
    body: new URLSearchParams({
        'tour_id': 'ID_DEL_TOUR'
    })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));




 */

