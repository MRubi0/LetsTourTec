import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdittoursComponent } from './edittours.component';

describe('EdittoursComponent', () => {
  let component: EdittoursComponent;
  let fixture: ComponentFixture<EdittoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdittoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdittoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
