// import { Injectable } from '@angular/core';
// import * as L from 'leaflet';
// import 'leaflet-routing-machine';

// @Injectable({
//   providedIn: 'root'
// })
// export class RoutingService {
//   constructor() { }

//   getRouter(apiKey: string) {
//     console.log("im here")
//     const customRouter = {
//       route: (waypoints: (L.LatLng | any)[], callback: (error: Error | null, routes?: any[]) => void, context?: any) => {
//         console.log(waypoints);


// /*         const coordinates = waypoints.map(wp => {
//           if (wp instanceof L.LatLng) {
//             return `${wp.lat},${wp.lng}`;
//           } else if (wp.latLng && wp.latLng instanceof L.LatLng) {
//             // Asumiendo que wp.latLng es una instancia de L.LatLng
//             return `${wp.latLng.lat},${wp.latLng.lng}`;
//           } else {
//             // Manejar el caso en el que wp o wp.latLng no sean instancias válidas de L.LatLng
//             console.error('Waypoint inválido:', wp);
//             return '';
//           }
//         }).join('|');

//         // Filtrar cualquier coordenada vacía que pueda haberse generado
//         const filteredCoordinates = coordinates.split('|').filter(coord => coord !== '').join('|');

//         if (!filteredCoordinates) {
//           console.error('No se encontraron coordenadas válidas');
//           callback(new Error('No valid coordinates'), []);
//           return;
//         }
//  */
//         const coordinates = [
//           L.latLng(41.65205, -4.72851),  // Punto 1
//           L.latLng(41.64786, -4.7294)    // Punto 2
//         ].map(wp => `${wp.lat},${wp.lng}`).join('|');
//         const start = `start=${coordinates.split('|')[0]}`;
// const end = `end=${coordinates.split('|')[1]}`;

// const url = `/v2/directions/foot-walking/geojson?api_key=${apiKey}&${start}&${end}`;
//         //const url = `https://api.openrouteservice.org/v2/directions/foot-walking/geojson?api_key=${apiKey}&start=${coordinates}&end=${coordinates}`;

//         fetch(url)
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return response.json();
//   })
//           .then(data => {

//             console.log("Respuesta de la API:", data);
//             if (data.features && data.features.length > 0) {
//               const route = data.features[0];
//               const result = [{
//                 name: route.properties.segments.map((segment: any) => segment.steps.map((step: any) => step.instruction).join(", ")).join(", "),
//                 coordinates: route.geometry.coordinates.map((coord: [number, number]) => L.latLng(coord[1], coord[0])),
//                 instructions: [], // Procesar instrucciones
//                 summary: {
//                   totalDistance: route.properties.summary.distance,
//                   totalTime: route.properties.summary.duration
//                 }
//               }];
//               callback(null, result);
//             } else {
//               callback(new Error('No route found'), []);
//             }
//           })
//           .catch((error: Error) => {
//             console.error("Error en la solicitud a la API:", error);
//             callback(error, []);
//           });
//         } 
//     };

//     return L.Routing.control({
//       router: customRouter as any,
//       routeWhileDragging: true
//       // ... otras opciones que desees configurar 
//     });
//   }
// }

import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  constructor() { }

  getRouter(apiKey: string) {
    const customRouter = {
      route: (waypoints: (L.LatLng | any)[], callback: (error: Error | null, routes?: any[]) => void, context?: any) => {
        // Definir el tipo de la variable 'routes'
        let routes: any[] = [];
        for (let index = 0; index < waypoints.length - 1; index++) {
          let startPoint = waypoints[index];
          let endPoint = waypoints[index + 1];

          let startCoordinates = startPoint instanceof L.LatLng ? `${startPoint.lat},${startPoint.lng}` : `${startPoint.latLng.lat},${startPoint.latLng.lng}`;
          let endCoordinates = endPoint instanceof L.LatLng ? `${endPoint.lat},${endPoint.lng}` : `${endPoint.latLng.lat},${endPoint.latLng.lng}`;

          let url = `/v2/directions/foot-walking/geojson?api_key=${apiKey}&start=${startCoordinates}&end=${endCoordinates}`;
          //let url = `https://api.openrouteservice.org/directions/foot-walking/geojson?api_key=${apiKey}&start=${startCoordinates}&end=${endCoordinates}`;
          
          fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              if (data.features && data.features.length > 0) {
                const route = data.features[0];
                routes.push({
                  name: route.properties.segments.map((segment: any) => segment.steps.map((step: any) => step.instruction).join(", ")).join(", "),
                  coordinates: route.geometry.coordinates.map((coord: [number, number]) => L.latLng(coord[1], coord[0])),
                  summary: {
                    totalDistance: route.properties.summary.distance,
                    totalTime: route.properties.summary.duration
                  }
                });
                // Llamar al callback cuando se procesan todos los waypoints
                if (index === waypoints.length - 2) {
                  callback(null, routes);
                }
              }
            })
            .catch((error: Error) => {
              console.error("Error en la solicitud a la API:", error);
              callback(error, []);
            });
        }
      }
    };

    return L.Routing.control({
      router: customRouter as any,
      routeWhileDragging: true
      // ... otras opciones que desees configurar
    });
  }
}
