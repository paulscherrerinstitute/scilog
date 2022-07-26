import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '../app-config.service';

import { SearchScrollService } from './search-scroll.service';

const getConfig = () => ({});

describe('SearchScrollService', () => {
  let service: SearchScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        { provide: SearchScrollService, useValue: {} },
      ],
    });
    service = TestBed.inject(SearchScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
