import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HotkeysComponent } from './hotkeys.component';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AppConfigService } from 'src/app/app-config.service';

const getConfig = () => ({});

describe('HotkeysComponent', () => {
  let component: HotkeysComponent;
  let fixture: ComponentFixture<HotkeysComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HotkeysComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: AppConfigService, useValue: { getConfig } },
      ],
    }).compileComponents();
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
