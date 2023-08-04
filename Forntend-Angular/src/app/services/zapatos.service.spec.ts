import { TestBed } from '@angular/core/testing';

import { ZapatosService } from './zapatos.service';

describe('ZapatosService', () => {
  let service: ZapatosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZapatosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
