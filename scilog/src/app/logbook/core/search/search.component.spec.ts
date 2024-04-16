import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchComponent } from './search.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const getConfig = () => ({});

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchComponent ],
      providers: [
        { provide: AppConfigService, useValue: { getConfig } },
      ],
      imports: [HttpClientTestingModule, BrowserAnimationsModule],
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
    const emitSpy = spyOn(component.close, 'emit');
    component.selectedSnippet('event');
    expect(emitSpy).toHaveBeenCalled();
    expect(component['scrollToElementService'].selectedItem).toEqual({
      event: 'event',
      config: undefined,
    });
  });

});
