import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private _mostrarModal = new BehaviorSubject<boolean>(false);
  public mostrarModal$ = this._mostrarModal.asObservable();

  constructor() {}

  abrirModal() {
    this._mostrarModal.next(true);
  }

  cerrarModal() {
    this._mostrarModal.next(false);
  }
}
