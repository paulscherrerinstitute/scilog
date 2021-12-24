import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnippetInfoSectionComponent } from './snippet-info-section.component';

describe('SnippetInfoSectionComponent', () => {
  let component: SnippetInfoSectionComponent;
  let fixture: ComponentFixture<SnippetInfoSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnippetInfoSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetInfoSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
