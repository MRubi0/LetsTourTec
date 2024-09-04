import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragedittoursComponent } from './dragedittours.component';

describe('DragedittoursComponent', () => {
  let component: DragedittoursComponent;
  let fixture: ComponentFixture<DragedittoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragedittoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragedittoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
