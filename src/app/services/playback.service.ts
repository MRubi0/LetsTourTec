import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaybackService {
  private currentPlayback = new BehaviorSubject<any>(null);
  private currentAudioPosition = new BehaviorSubject<number>(0);
  private isPlaying = new BehaviorSubject<boolean>(false);

  setCurrentPlayback(step: any) {
    this.currentPlayback.next(step);
  }

  getCurrentPlayback() {
    return this.currentPlayback.asObservable();
  }

  setCurrentAudioPosition(position: number) {
    this.currentAudioPosition.next(position);
  }

  getCurrentAudioPosition() {
    return this.currentAudioPosition.asObservable();
  }

  setIsPlaying(playing: boolean) {
    this.isPlaying.next(playing);
  }

  getIsPlaying() {
    return this.isPlaying.asObservable();
  }
}
