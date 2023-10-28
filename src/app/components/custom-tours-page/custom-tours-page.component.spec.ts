import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomToursPageComponent } from './custom-tours-page.component';

describe('CustomToursPageComponent', () => {
  let component: CustomToursPageComponent;
  let fixture: ComponentFixture<CustomToursPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomToursPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomToursPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
