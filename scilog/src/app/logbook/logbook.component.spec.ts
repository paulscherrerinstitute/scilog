import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppConfigService } from '../app-config.service';

import { LogbookComponent } from './logbook.component';

const getConfig = () => ({});

describe('LogbookComponent', () => {
  let component: LogbookComponent;
  let fixture: ComponentFixture<LogbookComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LogbookComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AppConfigService, useValue: { getConfig } }],
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

  it('should unset the logbook', () => {
    const popStateEvent = new PopStateEvent('popstate');
    Object.defineProperty(
      popStateEvent, 
      'target', 
      {writable: false, value: {location: {pathname: '/overview'}}}
    );
    window.dispatchEvent(popStateEvent);
    expect(component['logbookInfo'].logbookInfo).toBeNull();
  });

});
