import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { ToursDetailService } from 'src/app/services/tours-detail.service';
import { RoutingService } from 'src/app/services/routing.service';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MapService } from 'src/app/services/map.service';
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
  private watchId: number | null = null;
  private control: L.Routing.Control | null = null;
  detail:any;
  $url!:any;
  image_url:string='';
  convertedCoordinates: Array<any>=[];
  constructor(
    private toursDetailService:ToursDetailService,
    private activatedRoute:ActivatedRoute,
    private sharedService:SharedService,
    private mapService:MapService
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
 }  
  loadData(id: any) {
    this.tour_id=id;
    this.toursDetailService.getTourDetail(id).subscribe((data: any) => {
      this.detail = data[0].fields;
      this.toursDetailService.getAdditionalLocations(id).subscribe((locationsData: any) => {
        const additionalLocations = locationsData.locations;
        this.convertedCoordinates = additionalLocations.map((coord:any) => [coord.long, coord.lat]);
        this.convertedCoordinates.unshift([this.detail.longitude,this.detail.latitude]);
        this.loadMap();
      }); 
    }); 
    this.$url.subscribe((url: any) => {
      this.image_url = url;      
    }); 
  }
  loadMap(){
    try {
      this.mapService.createRouteDetail(this.convertedCoordinates).subscribe((data: any) => {
      if(data.message){
       console.log(data.message); 
       this.alternative();
      }else{
        this.lat = data.paths[0].points.coordinates[0][1];
        this.long = data.paths[0].points.coordinates[0][0];
        this.displayRouteOnMap(data);
      }
      
    });
    } catch (routeError) {
      console.error('Error al crear la ruta:', routeError);
    }  
  }
  ngAfterViewInit() {
            
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
    const map = L.map('map').setView(this.convertedCoordinates[0], 13);
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
  alternative(){
    const map = L.map('maps').setView([51.505, -0.09], 13);
    navigator.geolocation.getCurrentPosition((position) => {
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      this.control = L.Routing.control({
        waypoints: [
          L.latLng(latitud, longitud),
          L.latLng(this.lat, this.long)
        ],
        routeWhileDragging: true,
        collapsible: true, 
        show: true,  
        addWaypoints: false       
      }).addTo(map);

      this.control.on('waypointschanged', (e: any) => {
        e.waypoints.forEach((waypoint: any) => {
        });
      });

      this.control.on('routesfound', (e) => {
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

    this.watchId = navigator.geolocation.watchPosition((position) => {
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;   
      if (this.control) {
        this.control.setWaypoints([
          L.latLng(latitud, longitud),
          L.latLng(this.lat, this.long)
        ]);
      }
    }, (error) => {
      console.error(error);
    }, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    });
  }

  /*
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
  */  
}
