import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { AppConfigService } from 'src/app/app-config.service';

import { SearchWindowComponent } from './search-window.component';

const getConfig = () => ({});

describe('SearchWindowComponent', () => {
  let component: SearchWindowComponent;
  let fixture: ComponentFixture<SearchWindowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchWindowComponent ],
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        { provide: MatDialog, useValue: {} },
        { provide: LogbookInfoService, useValue: { logbookInfo: {id: 'id'} } },
      ],
      imports: [HttpClientTestingModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
