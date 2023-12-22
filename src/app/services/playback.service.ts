import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaybackService {
  private currentPlayback = new BehaviorSubject<any>(null);

  setCurrentPlayback(step: any) {
    this.currentPlayback.next(step);
  }

  getCurrentPlayback() {
    return this.currentPlayback.asObservable();
  }
}
