import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SettingsComponent } from './settings.component';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  @Component({})
  class DummyComponent {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: 'profileSettings' },
        provideRouter([
          {
            outlet: 'settings',
            path: 'profileSettings',
            component: DummyComponent,
          },
          { path: '*', component: DummyComponent },
        ]),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
