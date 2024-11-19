import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OverviewTableComponent } from './overview-table.component';
import { LogbookDataService } from 'src/app/core/remote-data.service';
import { UserPreferencesService } from 'src/app/core/user-preferences.service';
import { Logbooks } from 'src/app/core/model/logbooks';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class UserPreferencesMock {
  userInfo = { roles: ["roles"] };
}

describe('OverviewTableComponent', () => {
  let component: OverviewTableComponent;
  let fixture: ComponentFixture<OverviewTableComponent>;
  const logbookDataSpy = jasmine.createSpyObj(
    'LogbookDataService',
    ['getDataBuffer', 'getCount', 'deleteLogbook'],
    { imagesLocation: 'server/images' }
  );
  logbookDataSpy.getCount.and.returnValue({ count: 1 });
  logbookDataSpy.getDataBuffer.and.returnValue([{ abc: 1 }]);
  const paginatorSpy = jasmine.createSpyObj("MatPaginator", {}, { pageIndex: 0, pageSize: 5 });
  const sortSpy = jasmine.createSpyObj("MatSort", ['sort']);


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OverviewTableComponent],
      imports: [MatPaginatorModule, NoopAnimationsModule],
      providers: [
        { provide: LogbookDataService, useValue: logbookDataSpy },
        { provide: UserPreferencesService, useClass: UserPreferencesMock },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewTableComponent);
    component = fixture.componentInstance;
    component.config = { general: {}, filter: {}, view: {} };
    fixture.detectChanges();
    component.sort = sortSpy;
    component.sort.active = 'name';
    component.sort.direction = 'asc';
    component.paginator = paginatorSpy;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test itemsCount', async () => {
    await component['itemsCount']();
    expect(component.totalItems).toEqual(1);
  });

  it('should test getLogbooks', async () => {
    logbookDataSpy.getDataBuffer.calls.reset();
    await component.getLogbooks();
    expect(logbookDataSpy.getDataBuffer).toHaveBeenCalledOnceWith(0, 5, component.config);
    expect(component.dataSource.data).toEqual([{ abc: 1 } as Logbooks]);
    expect(component.isLoaded).toEqual(true);
  });

  it('should test openLogbook', () => {
    const routerSpy = spyOn(component['router'], 'navigateByUrl');
    component.openLogbook('123');
    expect(routerSpy).toHaveBeenCalledOnceWith('/logbooks/123/dashboard');
  });

  it('should test drop', () => {
    expect(component.displayedColumns).toEqual(['name', 'description', 'ownerGroup', 'createdAt', 'thumbnail', 'actions']);
    component.drop({ previousIndex: 1, currentIndex: 2 } as CdkDragDrop<string[]>);
    expect(component.displayedColumns).toEqual(['name', 'ownerGroup', 'description', 'createdAt', 'thumbnail', 'actions']);
  });

  [undefined, '123'].forEach(t => {
    it(`should test getImage ${t}`, () => {
      expect(component.getImage(t)).toEqual(t ? 'server/images/123' : t);
    });
  });

  it('should test onPageChange', () => {
    const getLogbooks = spyOn(component, 'getLogbooks');
    component.onPageChange();
    expect(getLogbooks).toHaveBeenCalledTimes(1);
  });

  it('should test onSortChange', () => {
    const getDatasetsSpy = spyOn(component, 'getLogbooks');
    component.onSortChange();
    expect(component['_config'].view.order).toEqual(['name asc']);
    expect(getDatasetsSpy).toHaveBeenCalledTimes(1);
  });

  [true, false, 'abc']
  .forEach((t, i) => {
    it(`should test reloadLogbooks ${i}`, async () => {
      const getLogbooksSpy = spyOn(component, 'getLogbooks');
      await component.reloadLogbooks();
      expect(getLogbooksSpy).toHaveBeenCalledTimes(1);
      if (typeof t === 'string')
        component['dataService'].searchString === 'abc';
      else if (t) {
        expect(component.sort.active).toEqual('');
        expect(component.sort.direction).toEqual('');
        expect(component['_config']).toEqual({ general: {}, filter: {}, view: {} });
      }
    });
  });

  it('should test deleteLogbook', async () => {
    const reloadSpy = spyOn(component, 'reloadLogbooks');
    await component.deleteLogbook('123');
    expect(logbookDataSpy.deleteLogbook).toHaveBeenCalledOnceWith('123');
    expect(reloadSpy).toHaveBeenCalledOnceWith(false);
  });

  it('should test afterLogbookEdit', async () => {
    const reloadSpy = spyOn(component, 'reloadLogbooks');
    await component.afterLogbookEdit();
    expect(reloadSpy).toHaveBeenCalledOnceWith(false);
  });

})
