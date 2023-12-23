import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { StepService } from 'src/app/services/step.service';
import { PlaybackService } from 'src/app/services/playback.service';


@Component({
  selector: 'app-music-player-detail',
  templateUrl: './music-player-detail.component.html',
  styleUrls: ['./music-player-detail.component.scss']
})
export class MusicPlayerDetailComponent implements OnInit {
  stepData: any;
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
  tourTitle: string = '';
  stepTitle: string = '';
  title: string = '';
  imageUrl: string = '';


  constructor(private playbackService:PlaybackService, private stepService:StepService, private cdRef: ChangeDetectorRef, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const tourId = this.route.snapshot.params['tourId'];
    const stepIndex = parseInt(this.route.snapshot.params['stepIndex']);
  
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state;
      this.stepData = state['step'];
      this.setTitle(state, stepIndex);
      this.setImage(state, stepIndex);
      this.setAudioSource(state, stepIndex);
    } else {
      this.stepService.getTourDetail(tourId).subscribe(data => {
        this.stepData = data.steps[stepIndex];
        this.setTitle(data, stepIndex);
        this.setImage(data, stepIndex);
        this.setAudioSource(data, stepIndex);
      });
    }
  
    this.playbackRates = this.generatePlaybackRates();
  }

  setTitle(data: any, stepIndex: number) {
    if (stepIndex === 0) {
      this.title = data.titulo + `- Starting point`; // Solo el título del tour para el paso 0
    } else {
      // Título del tour seguido por el título del paso o "Step X"
      this.title = data.titulo + (this.stepData.tittle ? `- ${this.stepData.tittle}` : `. Step ${stepIndex}`);
    }
  }
  private setImage(data: any, stepIndex: number) {
    // Establece la imagen basándose en si es el paso 0 o un paso diferente
    this.imageUrl = stepIndex === 0 ? data.image : this.stepData.image;
  }
  private setAudioSource(data: any, stepIndex: number) {
    // Si es el paso 0, usa el audio del tour; de lo contrario, usa el audio del paso
    this.audio = stepIndex === 0 ? data.audio : data.steps[stepIndex].audio;
  }
  

  ngAfterViewInit() {
    this.audioPlayer = this.audioPlayerRef.nativeElement;
    this.playbackService.getCurrentAudioPosition().subscribe(position => {
      this.audioPlayer.currentTime = position;
    });
  
    this.playbackService.getIsPlaying().subscribe(isPlaying => {
      if (isPlaying) {
        this.audioPlayer.play();
        this.isPlaying = true;
      }
    });
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
    this.playbackService.setCurrentAudioPosition(audio.currentTime);
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


}
