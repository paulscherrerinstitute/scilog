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
import { IDatasource } from 'ngx-ui-scroll';
import { ResizedEvent } from 'angular-resize-event';

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
    component.logbookIconScrollService.groupSize = 3;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  [
    {adapter: {firstVisible: {element: {}}}},
    {},
    {adapter: {firstVisible: {element: {querySelector: () => ({clientWidht: 0})}}}},
    {adapter: {firstVisible: {element: {querySelector: () => ({clientWidth: 10})}}}},    
  ].forEach((t, i) => {
    it(`should test get matCardWith ${i}`, () => {
      component['logbookIconScrollService']['datasource'] = t as unknown as IDatasource;
      expect(component.matCardWith).toEqual(i === 3? 10: 352);
    });
  });

  [[1, 1], [800, 2]].forEach(t => {
    it(`shokd test groupSize ${t[0]}`, () => {
      expect(component.groupSize(t[0])).toEqual(t[1]);
    });
  });

  [
    [{newRect: {width: 1056}}, [0, 0]], 
    [{newRect: {width: 700}, oldRect: {width: 300}}, [1, 0]], 
    [{newRect: {width: 100}, oldRect: {width: 300}}, [1, 0]],
    [{newRect: {width: 200}, oldRect: {width: 300}}, [0, 1]],
    [{newRect: {width: 400}, oldRect: {width: 300}}, [0, 1]],
  ].forEach((t, i) => {
    it(`shokd test onResized ${i}`, async () => {
      const initializeSpy = spyOn(component["logbookIconScrollService"], "initialize");
      const reloadSpy = spyOn(component["logbookIconScrollService"], "reload");
      await component.onResized(t[0] as ResizedEvent);
      expect(initializeSpy).toHaveBeenCalledTimes(t[1][0]);
      expect(reloadSpy).toHaveBeenCalledTimes(t[1][1]);
    });
  });

});
