import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScicatViewerComponent } from './scicat-viewer.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ScicatViewerComponent', () => {
  let component: ScicatViewerComponent;
  let fixture: ComponentFixture<ScicatViewerComponent>;
  const returnEmpty = () => ({});

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ScicatViewerComponent],
    imports: [],
    providers: [{ provide: AppConfigService, useValue: { getConfig: returnEmpty, getScicatSettings: returnEmpty } }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

    fixture = TestBed.createComponent(ScicatViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
