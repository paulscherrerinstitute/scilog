import { TestBed } from '@angular/core/testing';

import { ScrollToElementService } from './scroll-to-element.service';

describe('ScrollToElementService', () => {
  let service: ScrollToElementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollToElementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
