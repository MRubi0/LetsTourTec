import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCosoleComponent } from './admin-cosole.component';

describe('AdminCosoleComponent', () => {
  let component: AdminCosoleComponent;
  let fixture: ComponentFixture<AdminCosoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCosoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCosoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
