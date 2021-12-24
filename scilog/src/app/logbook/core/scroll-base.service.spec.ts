import { TestBed } from '@angular/core/testing';

import { ScrollBaseService } from './scroll-base.service';

describe('ScrollBaseService', () => {
  let service: ScrollBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScrollBaseService]
    });
    service = TestBed.inject(ScrollBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
