import { TestBed } from '@angular/core/testing';

import { AddContentService } from './add-content.service';

describe('AddContentService', () => {
  let service: AddContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
