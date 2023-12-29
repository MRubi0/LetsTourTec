import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  constructor() { }

  getRouter(apiKey: string, waypoints: any[]) {
    const routerControl = L.Routing.control({
      waypoints: waypoints,
      router: new L.Routing.OSRMv1({
        serviceUrl: `https://api.openrouteservice.org/v2/directions/foot-walking/geojson?api_key=${apiKey}`,
        profile: 'foot-walking',
      }),
      routeWhileDragging: true
    });
    return routerControl;
  }
}