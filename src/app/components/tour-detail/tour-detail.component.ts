import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { ToursDetailService } from 'src/app/services/tours-detail.service';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
// import { GraphHopperRouting } from 'leaflet-routing-machine/dist/leaflet-routing-machine';

@Component({
  selector: 'app-tour-detail',
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.scss']
})
export class TourDetailComponent {

  lat:number=0;
  long:number=0;
  tour_id:number=0;
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
  this.router.navigate([`/maps/${data.latitude}/${data.longitude}/${this.tour_id}`]);
 }  
  loadData(id: any) {
    this.tour_id=id;
    this.toursDetailService.getTourDetail(id).subscribe((data: any) => {
      this.detail = data[0].fields;
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
    const defaultIcon = L.icon({
      iconUrl: 'images/marker-icon.png',  
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'images/marker-shadow.png',
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;
    const map = L.map('map').setView([this.detail.latitude, this.detail.longitude], 13);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.marker([this.detail.latitude, this.detail.longitude], { icon: defaultIcon }).addTo(map); //nuevo

    

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
  
  additionalLocations.forEach(location => {
      const latLng = L.latLng(location.lat, location.long);
      L.marker(latLng, { icon: defaultIcon }).addTo(map);
      bounds.extend(latLng); 
    });  //nuevos

    
    // L.Routing.control({
    //   waypoints: waypoints,
    //   routeWhileDragging: true,
    //   collapsible: false,
    //   show: false,
    //   addWaypoints: false,
    // }).addTo(map);
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
