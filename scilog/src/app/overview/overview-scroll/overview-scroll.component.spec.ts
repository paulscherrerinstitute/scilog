import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { LogbookDataService } from 'src/app/core/remote-data.service';
import { UserPreferencesService } from 'src/app/core/user-preferences.service';
import { Logbooks } from 'src/app/core/model/logbooks';
import { OverviewScrollComponent } from './overview-scroll.component';
import { ResizedEvent } from 'src/app/core/directives/resized.directive';
import { ElementRef, QueryList } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

class UserPreferencesMock {
  userInfo = { roles: ["roles"] };
}

describe('OverviewScrollComponent', () => {
  let component: OverviewScrollComponent;
  let fixture: ComponentFixture<OverviewScrollComponent>;
  const logbookDataSpy = jasmine.createSpyObj(
    'LogbookDataService',
    ['getDataBuffer'],
  );
  logbookDataSpy.getDataBuffer.and.returnValue([{ abc: 1 }, {def: 2}, {ghi: 3}, {jkl: 4}]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OverviewScrollComponent],
      providers: [
        { provide: LogbookDataService, useValue: logbookDataSpy },
        { provide: UserPreferencesService, useClass: UserPreferencesMock },
      ],
      imports: [ScrollingModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.config = { general: {}, filter: {}, view: {} };
    component['groupSize'] = 3;
    component['pageSize'] = 20;
    component['endOfData'] = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test itemsCount', () => {
    expect(component.itemSize).toEqual(388.8);
  });

  it('should test setPageSize', () => {
    component['setPageSize'](2);
    expect(component['pageSize']).toEqual(21);
  });

  it('should test setGroupSize', () => {
    component['groupSize'] = 3;
    component['setGroupSize']({width: 332 * 2.6, height: 432 * 6});
    expect(component['groupSize']).toEqual(2);
    expect(component['pageSize']).toEqual(24);
  });

  it('should test elementSize', () => {
    expect(component['elementSize'](
      {nativeElement: {getBoundingClientRect: () => ({width: 10, height: 20})}})
    ).toEqual({width: 10, height: 20})
  });

  it('should test splitIntoGroups', () => {
    const groups = component['splitIntoGroups']([0,1,2,3,4,5,6,7,8,9] as Logbooks[]);
    expect(groups).toEqual([[0,1,2],[3,4,5],[6,7,8],[9]]);
  });

  it('should test regroupLogbooks', () => {
    component.logbooks = [[0,1,2],[3,4,5],[6,7,8],[9]] as Logbooks[][];
    component['groupSize'] = 4;
    expect(component['regroupLogbooks']()).toEqual([[0,1,2,3],[4,5,6,7],[8,9]]);
  });

  it('should test getLogbooks', async () => {
    logbookDataSpy.getDataBuffer.calls.reset();
    await component['getLogbooks']();
    expect(logbookDataSpy.getDataBuffer).toHaveBeenCalledOnceWith(0, 20, { general: {}, filter: {}, view: {} });
  });
  
  it('should test getAndGroupLogbooks', fakeAsync(async () => {
    logbookDataSpy.getDataBuffer.and.returnValue([{ abc: 1 }, {def: 2}, {ghi: 3}, {jkl: 4}]);
    const logbooks = await component['getAndGroupLogbooks']();

    expect(component['currentPage']).toEqual(1);
    expect(logbooks).toEqual([[{ abc: 1 }, {def: 2}, {ghi: 3}], [{jkl: 4}]]);
    expect(component['endOfData']).toEqual(true);
  }));

  [
    {sizes: [3, 19], spy: 'reshapeOnResize'},
    {sizes: [7, 20], spy: 'reshapeOnResize'},
    {sizes: [5, 21], spy: 'regroupLogbooks'},
  ].forEach((t, i) => {
    it(`should test refreshLogbooks ${i}`, async () => {
      const spy = spyOn<any>(component, t.spy);
      await component['refreshLogbooks'](t.sizes[0], t.sizes[1]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  it('should test compareAndRefreshSizes', async () => {
    const setGroupSizeSpy = spyOn<any>(component, 'setGroupSize');
    const refreshLogbooksSpy = spyOn<any>(component, 'refreshLogbooks');
    await component['compareAndRefreshSizes']({width: 10, height: 20});
    expect(setGroupSizeSpy).toHaveBeenCalledTimes(1);
    expect(refreshLogbooksSpy).toHaveBeenCalledTimes(1);
  });

  it('should test onScroll', async () => {
    const getLogbooksSpy = spyOn<any>(component, 'getLogbooks').and.resolveTo([]);
    await component.onScroll(0);
    await component.onScroll(1);
    expect(getLogbooksSpy).toHaveBeenCalledTimes(1);
  });

  it('should test onResized', async () => {
    const compareAndRefreshSizesSpy = spyOn<any>(component, 'compareAndRefreshSizes');
    await component.onResized({newRect: {width: 1, height: 2}} as ResizedEvent);
    expect(compareAndRefreshSizesSpy).toHaveBeenCalledOnceWith({width: 1, height: 2});
  });

  it('should test trackByGroupId', () => {
    const _id = component.trackByGroupId(1, [{id: '123'}, {id: '456'}, {id: '789'}]);
    expect(_id).toEqual('123456789');
  });

  it('should test ngAfterViewChecked', () => {
    spyOn<any>(component, 'elementSize');
    const compareAndRefreshSizesSpy = spyOn<any>(component, 'compareAndRefreshSizes');
    component.logbookWidgetComponent = [1, 2, 3] as unknown as QueryList<ElementRef>;
    expect(component.logbookWidgetComponent.length).toEqual(3);
    component.ngAfterViewChecked();
    expect(component['updateSizes']).toEqual(false);
    expect(compareAndRefreshSizesSpy).toHaveBeenCalledTimes(1);
  });

  [
    {pageSize: 18, spyCalls: 1, logbooks: [[1,2,3],[4,5,6],[7,8,9]]},
    {pageSize: 22, logbooks: [[1,2,3],[4,5]]},
    {endOfData: true, logbooks: [[1,2,3],[4,5,6],[7]]}
  ].forEach((t, i) => {
    it(`should test reshapeOnResize ${i}`, async () => {
      const getLogbooksSpy = spyOn<any>(component, 'getLogbooks').and.resolveTo([8,9]);
      component.logbooks = [[1,2,3], [4,5,6], [7]] as Logbooks[][];
      await component['reshapeOnResize'](t.pageSize);
      expect(getLogbooksSpy).toHaveBeenCalledTimes(t.spyCalls ?? 0);
      if (t.spyCalls) expect(getLogbooksSpy).toHaveBeenCalledOnceWith(t.pageSize, 2);
      expect(component.logbooks).toEqual(t.logbooks as Logbooks[][]);
    });
  });

  it('should test reloadLogbooks', fakeAsync(async () => {
    spyOn<any>(component, 'getAndGroupLogbooks');
    const scrollToOffset = spyOn(component.viewPort, 'scrollToOffset');
    await component.reloadLogbooks();
    expect(scrollToOffset).toHaveBeenCalledOnceWith(0);
    expect(component['currentPage']).toEqual(0);
  }));

})
