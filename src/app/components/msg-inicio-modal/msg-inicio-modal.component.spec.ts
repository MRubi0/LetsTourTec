import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsgInicioModalComponent } from './msg-inicio-modal.component';

describe('MsgInicioModalComponent', () => {
  let component: MsgInicioModalComponent;
  let fixture: ComponentFixture<MsgInicioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MsgInicioModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsgInicioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
