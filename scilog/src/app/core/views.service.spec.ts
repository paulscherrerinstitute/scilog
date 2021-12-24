import { TestBed } from '@angular/core/testing';

import { ViewsService } from './views.service';
import { ViewDataService } from '@shared/remote-data.service';
import { UserPreferencesService } from './user-preferences.service';

describe('ViewsService', () => {
  let service: ViewsService;
  let viewDataServiceSpy:any;
  let userPreferencesServiceSpy:any;

  viewDataServiceSpy = jasmine.createSpyObj("ViewDataService", ["getViews", "patchView", "postView"]);
  userPreferencesServiceSpy = jasmine.createSpyObj("UserPreferencesService", ["userInfo"]);
  userPreferencesServiceSpy.userInfo.and.returnValue({"username": "test_username"});

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ViewDataService, useValue: viewDataServiceSpy},
        { provide: UserPreferencesService, useValue: userPreferencesServiceSpy},

      ]
    });
    service = TestBed.inject(ViewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
