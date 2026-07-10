import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnippetInfoComponent } from './snippet-info.component';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('SnippetInfoComponent', () => {
  let component: SnippetInfoComponent;
  let fixture: ComponentFixture<SnippetInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
      imports: [MatDialogModule, SnippetInfoComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
