import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateToursComponent } from './validate-tours.component';

describe('ValidateToursComponent', () => {
  let component: ValidateToursComponent;
  let fixture: ComponentFixture<ValidateToursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidateToursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateToursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
