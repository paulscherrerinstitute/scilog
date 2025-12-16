import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppConfigService } from 'src/app/app-config.service';

import { SnippetTableComponent } from './snippet-table.component';

const getConfig = () => ({});

describe('SnippetTableComponent', () => {
  let component: SnippetTableComponent;
  let fixture: ComponentFixture<SnippetTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SnippetTableComponent],
      providers: [{ provide: AppConfigService, useValue: { getConfig } }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
