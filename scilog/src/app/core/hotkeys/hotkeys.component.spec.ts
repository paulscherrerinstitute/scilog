import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotkeysComponent } from './hotkeys.component';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

describe('HotkeysComponent', () => {
  let component: HotkeysComponent;
  let fixture: ComponentFixture<HotkeysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialog, useValue: {} },
      ],
      declarations: [ HotkeysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotkeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
