import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MatMenuModule } from '@angular/material/menu';

import { ToolbarComponent } from './toolbar.component';
import { AppConfigService } from 'src/app/app-config.service';
import { By } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const getConfig = () => ({});

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule, MatDialogModule, MatMenuModule, ToolbarComponent],
    providers: [{ provide: AppConfigService, useValue: { getConfig } }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting(),]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should setSearch', () => {
    component.showSearch = true;
    fixture.detectChanges();
    fixture.debugElement.query(
      By.css('app-search-window')
    ).triggerEventHandler('overviewSearch', 'searched');
    expect(component.searched).toEqual('searched');
  });

});
