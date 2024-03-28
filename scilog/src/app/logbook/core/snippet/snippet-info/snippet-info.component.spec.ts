import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnippetInfoComponent } from './snippet-info.component';
import { MatLegacyDialogModule as MatDialogModule, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

describe('SnippetInfoComponent', () => {
  let component: SnippetInfoComponent;
  let fixture: ComponentFixture<SnippetInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers:[
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ],
      imports: [
        MatDialogModule,         
      ],
      declarations: [ SnippetInfoComponent ]
    })
    .compileComponents();
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
