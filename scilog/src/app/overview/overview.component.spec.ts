import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { OverviewComponent } from './overview.component';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { CookieService } from 'ngx-cookie-service';
import { LogbookDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import {Pipe, PipeTransform} from '@angular/core';
import { Logbooks } from '@model/logbooks';

@Pipe({name: 'logbookSearch'})
class LogbookSearchMockPipe implements PipeTransform {
    transform(logbooks: Logbooks[], searchString: string){
        return logbooks;
    }
}

class UserPreferencesMock {
  userInfo = {
    roles: ["roles"]

  }
  currentCollectionsConfig = of({});
}

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let logbookInfoSpy:any;
  let logbookDataSpy:any;
  let cookiesSpy:any;


  logbookInfoSpy = jasmine.createSpyObj("LogbookInfoService", ["logbookInfo", "getAvailLogbooks"]);
  logbookInfoSpy.logbookInfo.and.returnValue([]);

  logbookDataSpy = jasmine.createSpyObj("LogbookDataService", ["deleteLogbook"]);
  logbookDataSpy.deleteLogbook.and.returnValue(of({}));

  cookiesSpy = jasmine.createSpyObj("CookieService", ["lastLogbook"]);
  cookiesSpy.lastLogbook.and.returnValue([]);
  
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewComponent, LogbookSearchMockPipe],
      imports: [MatDialogModule, RouterTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {provide: LogbookInfoService, useValue: logbookInfoSpy},
        {provide: UserPreferencesService, useClass: UserPreferencesMock},
        {provide: CookieService},
        {provide: LogbookDataService, useValue: logbookDataSpy},

      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
