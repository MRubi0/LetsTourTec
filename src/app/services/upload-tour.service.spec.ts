import { TestBed } from '@angular/core/testing';

import { UploadTourService } from './upload-tour.service';

describe('UploadTourService', () => {
  let service: UploadTourService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadTourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
