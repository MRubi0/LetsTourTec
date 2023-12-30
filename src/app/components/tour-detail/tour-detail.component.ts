import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { ToursDetailService } from 'src/app/services/tours-detail.service';
import { RoutingService } from 'src/app/services/routing.service';
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
    private routingService: RoutingService,
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
  
    // Configuración inicial del ícono de los marcadores
    const defaultIcon = L.icon({
      iconUrl: 'images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'images/marker-shadow.png',
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;
  
    // Creación del mapa
    const map = L.map('map').setView([this.detail.latitude, this.detail.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);
  
    // Crear el primer waypoint y marcador para la ubicación inicial
    const initialLatLng = L.latLng(this.detail.latitude, this.detail.longitude);
    L.marker(initialLatLng, { icon: defaultIcon }).addTo(map);
  
    // Inicializar los límites del mapa con el primer waypoint
    const bounds = new L.LatLngBounds(initialLatLng, initialLatLng);
  
    // Añadir waypoints adicionales y marcadores para cada ubicación
    additionalLocations.forEach(location => {
      const waypoint = L.latLng(location.lat, location.long);
      L.marker(waypoint, { icon: defaultIcon }).addTo(map);
      bounds.extend(waypoint); // Extender los límites del mapa para incluir este waypoint
    });
  
    map.fitBounds(bounds);
  
    // Configurar y añadir el control de enrutamiento
    console.log("Inicializando enrutamiento con waypoints:", [initialLatLng].concat(additionalLocations));

    const waypoints = [initialLatLng].concat(additionalLocations.map(location => L.latLng(location.lat, location.long)));
    console.log("Waypoints finales:", waypoints);

    const routerControl = this.routingService.getRouter('5b3ce3597851110001cf624862b9e2a13b0d4ab2be7475a8d4915b1d');
    routerControl.setWaypoints(waypoints);
  routerControl.addTo(map);
  
    // Deshabilitar la interacción con los marcadores
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
