import { TestBed } from '@angular/core/testing';

import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let dataServiceSpy: any;

  dataServiceSpy = jasmine.createSpyObj('UserPreferencesDataService', [
    'getUserPreferences',
    'getUserInfo',
    'postUserPreferences',
  ]);
  dataServiceSpy.getUserPreferences.and.returnValue(of({}));
  dataServiceSpy.postUserPreferences.and.returnValue(Promise.resolve({ id: '1' }));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserPreferencesService,
        { provide: UserPreferencesDataService, useValue: dataServiceSpy },
      ],
    });
    service = TestBed.inject(UserPreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
