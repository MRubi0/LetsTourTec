import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { ToursDetailService } from 'src/app/services/tours-detail.service';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
@Component({
  selector: 'app-tour-detail',
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.scss']
})
export class TourDetailComponent {

  lat:number=0;
  long:number=0;

  detail:any;
  $url!:any;
  image_url:string='';
  constructor(
    private toursDetailService:ToursDetailService,
    private activatedRoute:ActivatedRoute,
    private sharedService:SharedService,
    private router:Router,
    ){
      this.$url=this.sharedService.getImage;
      
  }

  ngOnInit(){    
  this.activatedRoute.params.subscribe((params:any)=>{
      this.loadData(params.id);
    });   
  }

  letsTour(data:any){
  this.sharedService.setCoordinates=data;
this.router.navigate([`/maps/${data.latitude}/${data.longitude}`]);
 }  
  loadData(id: any) {
    this.toursDetailService.getTourDetail(id).subscribe((data: any) => {
      this.detail = data[0].fields;
      console.log(this.detail);
      this.toursDetailService.getAdditionalLocations(id).subscribe((locationsData: any) => {
        const additionalLocations = locationsData.locations;
        this.initMap(additionalLocations);
      }); 
    }); 
    this.$url.subscribe((url: any) => {
      this.image_url = url;      
    }); 
  }

  initMap(additionalLocations: any[]) {
    if (!this.detail) return;
  
    const map = L.map('map').setView([this.detail.latitude, this.detail.longitude], 13);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);
    const waypoints = [L.latLng(this.detail.latitude, this.detail.longitude)];
    const bounds = new L.LatLngBounds(waypoints[0], waypoints[0]);
  
    waypoints.forEach(wp => {
      bounds.extend(wp); 
    });
  
    additionalLocations.forEach(location => {
      const waypoint = L.latLng(location.lat, location.long);
      waypoints.push(waypoint);
      bounds.extend(waypoint); 
    });
  
  
    L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: true,
      collapsible: false,
      show: false,
      addWaypoints: false,
    }).addTo(map);
    map.fitBounds(bounds);

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
  }
}
