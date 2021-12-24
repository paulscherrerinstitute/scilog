import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWindowComponent } from './search-window.component';

describe('SearchWindowComponent', () => {
  let component: SearchWindowComponent;
  let fixture: ComponentFixture<SearchWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchWindowComponent ]
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
