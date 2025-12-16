import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '../app-config.service';

import { SearchScrollService } from './search-scroll.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const getConfig = () => ({});

describe('SearchScrollService', () => {
  let service: SearchScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        SearchScrollService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
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
