import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private image!:BehaviorSubject<any>;
  private lat_long!:BehaviorSubject<any>;
  private profile!:BehaviorSubject<any>;

  constructor(private http: HttpClient) {
    this.image= new BehaviorSubject({});
    this.lat_long= new BehaviorSubject({});
    this.profile= new BehaviorSubject({});
   }
   
  set setImage(data:any){
    this.image.next(data);
  }
  get getImage(){
    return this.image.asObservable();    
  }

  set setCoordinates(data:any){
    this.lat_long.next(data);
  }
  get getCoordinates(){
    return this.lat_long.asObservable();    
  }

  set setProfile(data:any){
    this.profile.next(data);
  }
  get getProfile(){
    return this.profile.asObservable();    
  }
  
  getMediaValoraciones(tourId: number): Observable<any> {
    const url = `${environment.apiUrl}tour/${tourId}/media-valoracion/`;
    return this.http.get(url);
  }
}
