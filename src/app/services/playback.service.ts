import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PlaybackService {
  private currentPlayback = new BehaviorSubject<any>(null);
  private currentAudioPosition = new BehaviorSubject<number>(0);
  private isPlaying = new BehaviorSubject<boolean>(false);
  private currentAudioPositionSource = new BehaviorSubject<number>(0);

  currentAudioPosition$ = this.currentAudioPositionSource.asObservable()
    .pipe(
      debounceTime(100), // debounce de 100ms para evitar actualizaciones rápidas y repetidas
    );

  setCurrentPlayback(step: any) {
    console.log('setCurrentPlayback:', step);
    this.currentPlayback.next(step);
  }

  getCurrentPlayback() {
    return this.currentPlayback.asObservable();
  }

  setCurrentAudioPosition(position: number) {
    console.log('setCurrentAudioPosition:', position);
    this.currentAudioPosition.next(position);
  }

  getCurrentAudioPosition() {
    return this.currentAudioPosition.asObservable();
  }

  setIsPlaying(playing: boolean) {
    console.log('setIsPlaying:', playing);
    this.isPlaying.next(playing);
  }

  getIsPlaying() {
    return this.isPlaying.asObservable();
  }
}
