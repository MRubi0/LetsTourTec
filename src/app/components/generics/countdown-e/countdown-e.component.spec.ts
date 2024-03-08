import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountdownEComponent } from './countdown-e.component';

describe('CountdownEComponent', () => {
  let component: CountdownEComponent;
  let fixture: ComponentFixture<CountdownEComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountdownEComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountdownEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
