import { TestBed } from '@angular/core/testing';

import { MsgInicioModalService } from './msg-inicio-modal.service';

describe('MsgInicioModalService', () => {
  let service: MsgInicioModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsgInicioModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
