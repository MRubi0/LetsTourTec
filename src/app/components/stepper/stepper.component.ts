import { Component, ElementRef, OnChanges, QueryList, Renderer2, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StepService } from 'src/app/services/step.service';
import { environment } from 'src/enviroment/enviroment';
import * as L from 'leaflet';
import { MatDialog } from '@angular/material/dialog';
import { MapModalComponent } from 'src/app/components/map-modal/map-modal.component';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicPlayerComponent } from '../generics/music-player/music-player.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CountdownComponent } from '../generics/countdown/countdown.component';
import { MsgInicioModalComponent } from '../msg-inicio-modal/msg-inicio-modal.component';
import { SnackService } from 'src/app/services/snack.service';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {  
  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChildren(MusicPlayerComponent) audioComponents!: QueryList<MusicPlayerComponent>;
  @ViewChild(MusicPlayerComponent) musicPlayer!: MusicPlayerComponent;
  velocity_rate:number=1;
  volumen_rate:number=0.5;
  next!: Array<number>[];
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
  screenWidth: number = window.innerWidth;
  screenHeight: number = window.innerHeight;
  url_icon = '';
  url_icon_home = '../../../assets/iconos/home-white.svg'
  url_icon_flag = '../../../assets/iconos/win_flag.svg'
  lat: number = 0;
  long: number = 0;
  tour_id = '';
  tittle = '';
  tour: any;
  maps = 'maps';
  url = environment.bucket;
  audioControlsVisible = false;
  audioControlsVisibleTour = false;
  evento: any
  last_step=true;
  rates=0;
  isStepOpen: boolean[] = [];

  checkIfMapModalIsRequired(step: any) {
    this.audioControlsVisible = !(step.latitude && step.longitude);
  }

  constructor(private router: Router, private dialog: MatDialog, private _formBuilder: FormBuilder,
    private stepService: StepService, private activatedRoute: ActivatedRoute,
    private ngbModal: NgbModal, private snackService:SnackService
    ) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.activatedRoute.params.subscribe((params: any) => {
      this.tour_id = params.id;      
    });
    //this.openWelcomeModal();
    this.data();  
  }
  ngAfterViewInit() {}
  onStepChange(event: any) {
    this.isStepOpen.fill(false);
    this.isStepOpen[event.selectedIndex] = true; 
    const currentStep = this.tour.steps[event.selectedIndex];   
    this.checkIfMapModalIsRequired(currentStep); 
      const tourSteps = {
      index: event.selectedIndex,
      tour:  this.tour.relation
    };
    const tourStepsJSON = JSON.stringify(tourSteps);    
    if(event.selectedIndex!=0){
      localStorage.setItem('tour_steps', tourStepsJSON);
    }    
    if (event.previouslySelectedIndex == 0) {
      this.url_icon_home = '../../../assets/iconos/home-white.svg'
    }    
    if (event.selectedIndex >= 1){
      this.url_icon = '../../../assets/iconos/steps.svg';
      
    } else{
      this.url_icon_home = '../../../assets/iconos/home-white.svg'
    }    
    if(this.evento=='next_auto'){
      this.next=event.selectedIndex;      
    }
    if(this.tour.steps.length-1==event.selectedIndex){
      this.last_step=false;
    }else{
      this.last_step=true;
    }
    const aud = 'audio'+event.previouslySelectedIndex;
    if(event.previouslySelectedIndex!=undefined){
      this.audioComponents.forEach(audioComponent => {
        if(aud==audioComponent.audioPlayer.id){
          audioComponent.audioPlayer.pause();
        }
        this.rates=this.velocity_rate; 
        audioComponent.setVolume(this.volumen_rate);       
        audioComponent.changePlaybackRate(this.velocity_rate);           
      });
    }   
    const offsetTop = 176 + 72 * (event.selectedIndex);
    setTimeout(() => {
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }, 300);
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
      }, 0);
    });
  }
  stopEvent(e: MouseEvent): void {
    e.stopImmediatePropagation();
    e.stopPropagation();
  }

  data() {
    this.stepService.getTourDetail(this.tour_id).subscribe((data => {      
      this.tour = data;         
      let stepsWithOffset = [this.tour.steps[0], ...this.tour.steps];
      this.tour.steps = stepsWithOffset;

      if (this.tour.steps.length) {
        this.checkIfMapModalIsRequired(this.tour.steps[0]);
      } else {
        this.tour.steps.push('tour');
      } 
      setTimeout(() => {            
        const storedTourStepsJSON = localStorage.getItem('tour_steps');        
        if(storedTourStepsJSON){
          const storedTourSteps = JSON.parse(storedTourStepsJSON);    
          const tourIds:Array<Number>=storedTourSteps.tour;          
          if(tourIds.includes(Number(this.tour_id)) && this.stepper){          
            this.stepper.selectedIndex = storedTourSteps.index;
          }
        }    
      }, 2000);      
    }));
  }
  openMapModal(lat: number, lng: number): void {
    this.audioControlsVisible = false;
    const dialogRef = this.dialog.open(MapModalComponent, {
      width: `${Math.min(this.screenWidth * 0.9, 800)}px`,
      maxWidth: 'none',

    });
    dialogRef.componentInstance.cordinates={ lat: lat, long: lng }
    dialogRef.afterClosed().subscribe(result => {
      this.audioControlsVisible = this.audioControlsVisibleTour =true;
    });
  }
  goToNextStep(event:string) {
    this.evento=event;
    this.stepper.next();
  }
  goToPreviousStep() {
    this.stepper.previous();
  }
  musicAction(event: string) {
    if (event === 'next' || event === 'next_auto') {
      if (this.isLastStep()) { 
        this.finishTour();       
        const modalRef=this.ngbModal.open(CountdownComponent,{ size: 'sm'});   
        modalRef.componentInstance.id = this.tour_id;     
        return;
      }      
      this.goToNextStep(event);
    } else {
        this.goToPreviousStep();
      }
  }
  finishTour() {
    const tourId = this.tour_id;
    this.stepService.createTourRecord(tourId).subscribe(
      (response:any) => {
        console.log('Tour finalizado:', response)
        this.router.navigate(['/exit/'+this.tour_id]);
      },
      (error:any)=>{
        this.snackService.openSnackBar(error.error.error, 'error');
        this.router.navigate(['/exit/' + this.tour_id]);
      }
    );
  }

  isLastStep(): boolean {
    const currentIndex = this.stepper.selectedIndex;
    return currentIndex === this.tour.steps.length - 1;
  }
  /* openWelcomeModal(): void {
    const modalShown = sessionStorage.getItem('welcomeModalShown');
  
    if (!modalShown) {
      // Si el modal no ha sido mostrado, abrirlo
      this.dialog.open(MsgInicioModalComponent, {
        width: '500px'
      });
  
      // Guardar en sessionStorage que el modal ya ha sido mostrado
      sessionStorage.setItem('welcomeModalShown', 'true');
    }
  } */
  velocity(event:any){
    this.velocity_rate=event;
  }
  volumen(event:any){
    this.volumen_rate=event;
  }
}