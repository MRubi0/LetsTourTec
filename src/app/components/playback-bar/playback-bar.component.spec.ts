import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaybackBarComponent } from './playback-bar.component';

describe('PlaybackBarComponent', () => {
  let component: PlaybackBarComponent;
  let fixture: ComponentFixture<PlaybackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaybackBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaybackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
