import { TestBed } from '@angular/core/testing';

import { CalificacionServiceService } from './calificacion-service.service';

describe('CalificacionServiceService', () => {
  let service: CalificacionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalificacionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
