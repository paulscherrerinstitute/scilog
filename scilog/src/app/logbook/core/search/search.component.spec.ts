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

  it('should submitSearch', () => {
    const resetSpy = spyOn<any>(component.searchScrollService, 'reset');
    component.submitSearch();
    expect(resetSpy).toHaveBeenCalled();
  });

  it('should selectedSnippet', () => {
    const emitSpy = spyOn(component.close, 'emit');
    component.selectedSnippet('');
    expect(emitSpy).toHaveBeenCalled();
  });

});
