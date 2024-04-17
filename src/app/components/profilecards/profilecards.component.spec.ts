import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilecardsComponent } from './profilecards.component';

describe('ProfilecardsComponent', () => {
  let component: ProfilecardsComponent;
  let fixture: ComponentFixture<ProfilecardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilecardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilecardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
