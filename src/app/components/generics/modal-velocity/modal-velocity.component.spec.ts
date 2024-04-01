import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVelocityComponent } from './modal-velocity.component';

describe('ModalVelocityComponent', () => {
  let component: ModalVelocityComponent;
  let fixture: ComponentFixture<ModalVelocityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalVelocityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalVelocityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
