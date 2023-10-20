import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private image!:BehaviorSubject<any>;

  constructor() {
    this.image= new BehaviorSubject({});
   }
   
  set setImage(data:any){
    this.image.next(data);
  }
  get getImage(){
    return this.image.asObservable();    
  }
}
