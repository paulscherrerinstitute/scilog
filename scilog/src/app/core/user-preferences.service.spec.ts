import { TestBed } from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let dataServiceSpy:any;

  dataServiceSpy = jasmine.createSpyObj("UserPreferencesDataService", ["getUserPreferences", "getUserInfo"]);
  dataServiceSpy.getUserPreferences.and.returnValue(of({}));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserPreferencesService,
        {provide: UserPreferencesDataService, useValue: dataServiceSpy}
      ],
    });
    service = TestBed.inject(UserPreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
