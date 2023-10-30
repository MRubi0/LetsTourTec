import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private image!:BehaviorSubject<any>;
  private lat_long!:BehaviorSubject<any>;

  constructor() {
    this.image= new BehaviorSubject({});
    this.lat_long= new BehaviorSubject({});
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
}
