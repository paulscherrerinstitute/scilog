import { TestBed } from '@angular/core/testing';

import { SearchScrollService } from './search-scroll.service';

describe('SearchScrollService', () => {
  let service: SearchScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
