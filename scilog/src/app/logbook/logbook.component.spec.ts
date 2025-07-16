import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppConfigService } from '../app-config.service';

import { LogbookComponent } from './logbook.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const getConfig = () => ({});

describe('LogbookComponent', () => {
  let component: LogbookComponent;
  let fixture: ComponentFixture<LogbookComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule, LogbookComponent],
    providers: [{ provide: AppConfigService, useValue: { getConfig } }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set mobile true', () => {
    window.innerWidth = 10;
    component['setMobileDependentOptions']();
    expect(component.mobile).toEqual(true);
    expect(component.sidenavOpened).toEqual(false);
    expect(component.sidenavOver).toEqual('over');
  });

  it('should set mobile false', () => {
    window.innerWidth = 2000;
    component['setMobileDependentOptions']();
    expect(component.mobile).toEqual(false);
    expect(component.sidenavOpened).toEqual(true);
    expect(component.sidenavOver).toEqual('side');
  });

});
