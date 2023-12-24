import { Component, ElementRef, OnChanges, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StepService } from 'src/app/services/step.service';
import { environment } from 'src/enviroment/enviroment';
import * as L from 'leaflet';
import { MatDialog } from '@angular/material/dialog';
import { MapModalComponent } from 'src/app/components/map-modal/map-modal.component';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';

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
  url_icon='';
  url_icon_home='../../../assets/iconos/home-white.svg'
  lat:number=0;
  long:number=0;
  tour_id='';
  tour:any;
  maps='maps';
  url=environment.bucket;
  audioControlsVisible = false;

  checkIfMapModalIsRequired(step: any) {
    this.audioControlsVisible = !(step.latitude && step.longitude);
  }


  @ViewChild(MatStepper) stepper!: MatStepper;


  constructor(private dialog: MatDialog, private _formBuilder: FormBuilder, 
    private stepService:StepService, private elRef: ElementRef, private renderer: Renderer2, private activatedRoute: ActivatedRoute,private router: Router) { }

  ngOnInit(){
    this.firstFormGroup = this._formBuilder.group({      
      firstCtrl: ['', Validators.required]
    });
    this.activatedRoute.params.subscribe((params: any) => {
      this.tour_id=params.id
    });
  }
  ngAfterViewInit(){
    this.data();
  }
  onStepChange(event:any){
    const currentStep = this.tour.steps[event.selectedIndex];
    this.checkIfMapModalIsRequired(currentStep);
    if(event.previouslySelectedIndex>=0){
      this.url_icon_home='../../../assets/iconos/home-white.svg'
    }
    if(event.selectedIndex >= 1){
      this.url_icon='../../../assets/iconos/steps.svg';
    }else{
      this.url_icon_home='../../../assets/iconos/home-white.svg'
    }
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
    this.stepService.getTourDetail(this.tour_id).subscribe((data=>{
      this.tour=data; 
      if(this.tour.steps.length){        
        this.checkIfMapModalIsRequired(this.tour.steps[0]);
      }else{
        this.tour.steps.push('tour');
      }           
    }));
  }
  openMapModal(lat: number, lng: number): void {
    this.audioControlsVisible = false;
    const dialogRef = this.dialog.open(MapModalComponent, {
      width: `${Math.min(this.screenWidth * 0.9, 800)}px`,
            maxWidth: 'none',
      data: { latitude: lat, longitude: lng }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.audioControlsVisible = true;
    });
  } 
  goToNextStep() {
    this.stepper.next();
  }

  goToPreviousStep() {
    this.stepper.previous(); 
  }
  musicAction(event: string) {
  if (event === 'next') {
      if (this.isLastStep()) {
        this.finishTour();
        this.router.navigate(['/exit']);
        return;
      }
      this.goToNextStep();
    } else {
      this.goToPreviousStep();
    }
  }
  finishTour() {
    const tourId = this.tour_id;
    this.stepService.createTourRecord(tourId).subscribe(
      response => console.log('Tour finalizado:', response),
      error => console.error('Error al finalizar el tour:', error)
    );
  }
  
  isLastStep(): boolean {
    const currentIndex = this.stepper.selectedIndex;
    return currentIndex === this.tour.steps.length - 1;
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

