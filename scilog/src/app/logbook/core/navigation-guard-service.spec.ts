import { TestBed } from '@angular/core/testing';

import { NavigationGuardService } from './navigation-guard-service';
import { LogbookInfoService } from 'src/app/core/logbook-info.service';

describe('CanDeactivateGuard', () => {
  let service: NavigationGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NavigationGuardService,
        { provide: LogbookInfoService, useValue: { logbookInfo: { id: 'id' } } }
      ]
    });
    service = TestBed.inject(NavigationGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true on back', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    expect(service.canDeactivate({canDeactivate: () => false})).toBeTrue();
  });

  it('should return false on back', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    expect(service.canDeactivate({canDeactivate: () => false})).toBeFalse();
  });

});
