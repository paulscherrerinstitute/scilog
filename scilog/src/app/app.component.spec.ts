import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { LogbookInfoService } from './core/logbook-info.service';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: LogbookInfoService, 
          useValue: { logbookInfo: {id: 'id'} }
        }
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // it(`should have as title 'scilog'`, () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   expect(app.title).toEqual('SciLog');
  // });

  it('should unset the logbook', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const popStateEvent = new PopStateEvent('popstate');
    Object.defineProperty(
      popStateEvent, 
      'target', 
      {writable: false, value: {location: {pathname: '/overview'}}}
    );
    window.dispatchEvent(popStateEvent);
    expect(app['logbookInfo'].logbookInfo).toBeNull();
  });
});
