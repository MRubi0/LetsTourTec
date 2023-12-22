import { Component, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-playback-bar',
  templateUrl: './playback-bar.component.html',
  styleUrls: ['./playback-bar.component.scss']
})

export class PlaybackBarComponent {
  @Input() currentStep: any; // Puedes reemplazar 'any' con el tipo adecuado para tus pasos
  @Output() detailRequested = new EventEmitter<void>();

  openDetail() {
    this.detailRequested.emit();
  }
}
