import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '../app-config.service';

import { SearchScrollService } from './search-scroll.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const getConfig = () => ({});

describe('SearchScrollService', () => {
  let service: SearchScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        SearchScrollService
      ],
    });
    service = TestBed.inject(SearchScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should reset', () => {
    const setSearchSpy = spyOn<any>(service, 'setSearchString');
    service.reset('some');
    expect(setSearchSpy).toHaveBeenCalledOnceWith('some');
  });

});
