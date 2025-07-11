import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  key='74f72b76-bb28-4bb8-b862-a756103cb2b1';

  constructor(private http: HttpClient) { }  

  createRoute(lat_dest: number, long_dest: number, lat_org: number, long_org: number) {
    const url = `${environment.apiUrl}get_routes`;
    return this.http.post(url,
      {
        "points": [
          [long_dest, lat_dest],
          [lat_org, long_org]
        ],
        "snap_preventions": ["motorway", "ferry", "tunnel"],
        "details": ["road_class", "surface"],
        "profile": "foot",
        "locale": "en",
        "instructions": true,
        "calc_points": true,
        "points_encoded": false
      }
    ).pipe(
      catchError((error:any) => {
        console.error('Error en createRoute:', error);
        return throwError('Error en la solicitud de ruta');
      })
    );
  }
  createRouteDetail(route:any) {
    const url = `${environment.apiUrl}get_routes`;
    console.log('route ',route);
    return this.http.post(url,
      {
        "points": 
          route
        ,
        "snap_preventions": ["motorway", "ferry", "tunnel"],
        "details": ["road_class", "surface"],
        "profile": "foot",
        "locale": "en",
        "instructions": true,
        "calc_points": true,
        "points_encoded": false
      }
    ).pipe(
      catchError((error:any) => {
        console.error('Error en createRoute:', error);
        return throwError('Error en la solicitud de ruta');
      })
    );
  }
}

//            L.latLng(41.65205, -4.72851),  // Punto 1
//           L.latLng(41.64786, -4.7294)    // Punto 2