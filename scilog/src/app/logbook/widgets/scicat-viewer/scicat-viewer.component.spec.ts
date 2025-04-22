import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScicatViewerComponent } from './scicat-viewer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppConfigService } from 'src/app/app-config.service';

describe('ScicatViewerComponent', () => {
  let component: ScicatViewerComponent;
  let fixture: ComponentFixture<ScicatViewerComponent>;
  const returnEmpty = () => ({});

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ScicatViewerComponent],
      providers: [{ provide: AppConfigService, useValue: { getConfig: returnEmpty, getScicatSettings: returnEmpty } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ScicatViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
