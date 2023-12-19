import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicPlayerDetailComponent } from './music-player-detail.component';

describe('MusicPlayerDetailComponent', () => {
  let component: MusicPlayerDetailComponent;
  let fixture: ComponentFixture<MusicPlayerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MusicPlayerDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicPlayerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
