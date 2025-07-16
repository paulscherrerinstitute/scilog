import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnippetInfoSectionComponent } from './snippet-info-section.component';

describe('SnippetInfoSectionComponent', () => {
  let component: SnippetInfoSectionComponent;
  let fixture: ComponentFixture<SnippetInfoSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [SnippetInfoSectionComponent]
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
