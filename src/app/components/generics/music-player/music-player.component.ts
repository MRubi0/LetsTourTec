import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import * as Hammer from 'hammerjs';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss']
})
export class MusicPlayerComponent {
  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.getScreenSize();
  }
  @ViewChild('element') element!: ElementRef;
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef;
  @Input('audio') audio!:string;
  @Input('index') index!:number;
  @Output() stepChange = new EventEmitter<string>();
  audioPlayer!: HTMLAudioElement;
  isPlaying: boolean = false;
  volume: number = 0.5;
  playbackRate: number = 1.0;
  playbackRates!: Array<number>;
  bar_volume:boolean=false;
  durationInSeconds: number = 0;
  currentTimeInSeconds: number = 0;
  currentTime: number = 0;
  timer: any;
  screenHeight!: number;
  screenWidth!: number;
  bar_volume_small:boolean=true;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(){
    this.playbackRates = this.generatePlaybackRates();  
    this.getScreenSize();  
  }
  ngAfterViewInit() {
    this.audioPlayer = this.audioPlayerRef.nativeElement;
    this.audioPlayer.volume = this.volume;
    this.audioPlayer.playbackRate = this.playbackRate;

    this.audioPlayerRef.nativeElement.onloadedmetadata = () => {
      this.durationInSeconds = Math.floor(this.audioPlayerRef.nativeElement.duration);
  };

  const mc = new Hammer(this.element.nativeElement); 
    mc.get('doubletap').set({ event: 'doubletap' });
    mc.on('doubletap', (ev:any) => {
      this.onDoubleTap(ev);
    });
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
  action(event:string){
    this.audioPlayer.pause();
    this.stepChange.emit(event);
  }
  showVolumeBar() {
    this.bar_volume = true;
    this.timer = setTimeout(() => {
      this.bar_volume = false; 
      this.cdRef.detectChanges();
    }, 1000);
  }
  cancelTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  onDoubleTap(event: any): void {
    this.action('back');
  }
  getScreenSize() {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth<=991){
      this.bar_volume=false;
      this.bar_volume_small=true;
      return;
    }
    this.bar_volume=true;
    this.bar_volume_small=false;
  }
}
