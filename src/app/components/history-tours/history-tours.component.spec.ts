import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryToursComponent } from './history-tours.component';

describe('HistoryToursComponent', () => {
  let component: HistoryToursComponent;
  let fixture: ComponentFixture<HistoryToursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryToursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryToursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
