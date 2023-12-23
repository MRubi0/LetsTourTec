import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { PlaybackService } from 'src/app/services/playback.service';



@Component({
  selector: 'app-playback-bar',
  templateUrl: './playback-bar.component.html',
  styleUrls: ['./playback-bar.component.scss']
})

export class PlaybackBarComponent {
  @Input() currentStep: any;
  @Output() detailRequested = new EventEmitter<void>();

  constructor(private playbackService: PlaybackService, private cdRef: ChangeDetectorRef) {
    this.playbackService.getCurrentPlayback().subscribe(step => {
      setTimeout(() => {
      this.currentStep = step;
      this.cdRef.detectChanges(); 
    });
  });
  }
  getTitle(step: any): string {
    if (!step) return '';

    if (step.index === 0) {
      return step.data.titulo + `- Starting point`;
    } else {
      return step.data.titulo + (step.data.tittle ? `- ${step.data.tittle}` : `. Step ${step.index}`);
    }
  }

  openDetail() {
    this.detailRequested.emit();
  }
}