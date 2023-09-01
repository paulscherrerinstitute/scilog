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

  it('should unset the logbook', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    service.canDeactivate({canDeactivate: () => true});
    expect(service['logbookInfo'].logbookInfo).toBeNull();
  });

  it('should not unset the logbook', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    service.canDeactivate({canDeactivate: () => true});
    expect(service['logbookInfo'].logbookInfo).toEqual({ id: 'id' });
  });


});