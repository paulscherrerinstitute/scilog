import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchComponent } from './search.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const getConfig = () => ({});

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule, SearchComponent],
    providers: [
        { provide: AppConfigService, useValue: { getConfig } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should selectedSnippet', () => {
    const emitSpy = spyOn(component.closed, 'emit');
    component.selectedSnippet('event');
    expect(emitSpy).toHaveBeenCalled();
    expect(component['scrollToElementService'].selectedItem).toEqual({
      event: 'event',
      config: undefined,
    });
  });

});
