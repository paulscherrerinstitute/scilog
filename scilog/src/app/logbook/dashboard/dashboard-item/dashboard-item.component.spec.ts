import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing'
import { DashboardItemComponent } from './dashboard-item.component';
import { ViewsService } from '@shared/views.service';
import { ViewsServiceMock } from '../../../logbook/widgets/logbook-item/logbook-item.component.spec';

describe('DashboardItemComponent', () => {
  let component: DashboardItemComponent;
  let fixture: ComponentFixture<DashboardItemComponent>;
  let viewsSpy:any;
  viewsSpy = jasmine.createSpyObj("ViewsService", ["getLogbookViews"]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ViewsService, useClass: ViewsServiceMock}
      ],

      declarations: [ DashboardItemComponent ],
      imports: [
        MatDialogModule,
        RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
