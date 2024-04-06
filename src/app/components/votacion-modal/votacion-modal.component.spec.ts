import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotacionModalComponent } from './votacion-modal.component';

describe('VotacionModalComponent', () => {
  let component: VotacionModalComponent;
  let fixture: ComponentFixture<VotacionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VotacionModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotacionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
