import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private calificacionSubject = new BehaviorSubject<number | null>(null);
  calificacion$ = this.calificacionSubject.asObservable();

  setCalificacion(calificacion: number | null) {
    this.calificacionSubject.next(calificacion);
  }
}
