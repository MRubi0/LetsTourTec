import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss']
})
export class MusicPlayerComponent {
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef;
  @Input('audio') audio!:string;
  
  audioPlayer!: HTMLAudioElement;
  isPlaying: boolean = false;
  volume: number = 0.5;
  playbackRate: number = 1.0;
  playbackRates!: Array<number>;
  bar_volume:boolean=false;
  durationInSeconds: number = 0;
  currentTimeInSeconds: number = 0;
  currentTime: number = 0;
  
  constructor() {}

  ngOnInit(){
    this.playbackRates = this.generatePlaybackRates();
  }
  ngAfterViewInit() {
    this.audioPlayer = this.audioPlayerRef.nativeElement;
    this.audioPlayer.volume = this.volume;
    this.audioPlayer.playbackRate = this.playbackRate;

    this.audioPlayerRef.nativeElement.onloadedmetadata = () => {
      this.durationInSeconds = Math.floor(this.audioPlayerRef.nativeElement.duration);
  };
  }

  generatePlaybackRates(): number[] {
    const rates: number[] = [];
    for (let rate = 0.25; rate <= 2; rate += 0.25) {
      rates.push(rate);
    }
    return rates;
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.audioPlayer.pause();
    } else {
      this.audioPlayer.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  skipForward() {
    this.audioPlayer.currentTime += 10;
  }

  skipBackward() {
    this.audioPlayer.currentTime -= 10;
  }

  setVolume(value: number) {
    this.audioPlayer.volume = value;
    this.volume = value;
  }

  changePlaybackRate(value: number) {
    this.audioPlayer.playbackRate = value;
    this.playbackRate = value;
  }

  restart() {
    this.audioPlayer.currentTime = 0;
    this.audioPlayer.play();
    this.isPlaying = true;
  }

  updateTime(event: Event) {    
    const audio = event.target as HTMLAudioElement;    
    this.currentTime = audio.currentTime;
    this.currentTimeInSeconds = Math.floor(audio.currentTime);
}

  seekTo(event: Event) {      
      const audio = this.audioPlayerRef.nativeElement as HTMLAudioElement;
      audio.currentTime = parseInt((event.target as HTMLInputElement).value);
  }
}
