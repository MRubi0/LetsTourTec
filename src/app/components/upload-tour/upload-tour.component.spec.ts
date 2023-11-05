import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadTourComponent } from './upload-tour.component';

describe('UploadTourComponent', () => {
  let component: UploadTourComponent;
  let fixture: ComponentFixture<UploadTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadTourComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
