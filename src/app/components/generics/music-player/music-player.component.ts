import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ChangeDetectorRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as Hammer from 'hammerjs';
import { SharedService } from 'src/app/services/shared.service';
import { ModalVelocityComponent } from '../modal-velocity/modal-velocity.component';
import {MatMenuTrigger, MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss']
})
export class MusicPlayerComponent implements OnChanges {
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.getScreenSize();
  }
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild('element') element!: ElementRef;  
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef;  
  @Input('audio') audio!: string;
  @Input('index') index!: number;
  @Input('next') next!: any;
  @Input('last') last!: any;  
  @Input('rates') rates!:any;
  @Input('volum') volum!:any;
  @Output() stepChange = new EventEmitter<string>();
  @Output() emitRates = new EventEmitter<number>();
  @Output() emitVolumen = new EventEmitter<number>();
  audioPlayer!: HTMLAudioElement;
  isPlaying: boolean = false;
  volume: number = 0.5;
  playbackRate: number = 1.0;
  playbackRates!: Array<number>;
  bar_volume: boolean = false;
  durationInSeconds: number = 0;
  currentTimeInSeconds: number = 0;
  currentTime: number = 0;
  timer: any;
  screenHeight!: number;
  screenWidth!: number;
  bar_volume_small: boolean = true;
  

  constructor(private cdRef: ChangeDetectorRef, private sharedService:SharedService, public dialog: MatDialog) { }

  ngOnInit() {
    this.playbackRates = this.generatePlaybackRates();
    this.getScreenSize();   
  }
  ngAfterViewInit() {
    this.audioPlayer = this.audioPlayerRef.nativeElement;
    this.audioPlayer.volume = this.volume;
    this.audioPlayer.playbackRate = this.playbackRate;

    this.audioPlayerRef.nativeElement.onloadedmetadata = () => {
      this.durationInSeconds = Math.floor(this.audioPlayerRef.nativeElement.duration);
      this.audioPlayerRef.nativeElement.addEventListener('ended', () => {
        this.stepChange.emit('next_auto');
      });
    };
    const mc = new Hammer(this.element.nativeElement);
    mc.get('doubletap').set({ event: 'doubletap' });
    mc.on('doubletap', (ev: any) => {
      this.onDoubleTap(ev);
    });

    if(this.rates>0 && this.rates!=undefined){
      this.changePlaybackRate(this.rates);
    }
    if(this.volum>0 && this.volum!=undefined){
      this.setVolume(this.volum);
    } 
    this.cdRef.detectChanges(); 
  }

  ngOnChanges(changes: SimpleChanges): void {
   if (this.audioPlayerRef) {               
      if(changes['next']){
        const minus = changes['next'].currentValue - changes['next'].previousValue;
        this.audioPlayer = this.audioPlayerRef.nativeElement;         
      if (changes['next'].currentValue > 0 &&
        this.audioPlayerRef.nativeElement.id == 'audio'+changes['next'].currentValue
      ) {       
        if (minus==1 || changes['next'].previousValue == undefined){
          this.audioPlayer.play();
          this.isPlaying=true
        }  
        else{
          this.audioPlayer.pause();
        }      
      }
     }           
    }
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
    this.emitVolumen.emit(value); 
  }

  changePlaybackRate(value: number) {
    this.audioPlayer.playbackRate = value;
    this.playbackRate = value;
    this.emitRates.emit(value);    
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
  action(event: string) {
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
    if (this.screenWidth <= 991) {
      this.bar_volume = false;
      this.bar_volume_small = true;
      return;
    }
    this.bar_volume = true;
    this.bar_volume_small = false;
  }

  openDialog() {
    const dialogRef = this.dialog.open(ModalVelocityComponent, {restoreFocus: false});    
    dialogRef.afterClosed().subscribe(() => this.menuTrigger.focus());
  }

  /*nextMusic(){
    this.audioPlayer = this.audioPlayerRef.nativeElement;
    this.audioPlayer.play();
  }*/
}
