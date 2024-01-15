import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  key='74f72b76-bb28-4bb8-b862-a756103cb2b1';

  constructor(private http: HttpClient) { }  

  createRoute() {
    const url = `${environment.apiUrl}api/get_routes`;
    return this.http.post(url, 
      {
        "points": [
          [
            11.539421,
            48.118477
          ],
          [
            11.559023,
            48.12228
          ]
        ],
        "snap_preventions": [
          "motorway",
          "ferry",
          "tunnel"
        ],
        "details": [
          "road_class",
          "surface"
        ],
        "profile": "car",
        "locale": "en",
        "instructions": true,
        "calc_points": true,
        "points_encoded": false
      },
      );
  }
}
