import { TestBed } from '@angular/core/testing';

import { SpareService } from './spare.service';

describe('SpareService', () => {
  let service: SpareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
