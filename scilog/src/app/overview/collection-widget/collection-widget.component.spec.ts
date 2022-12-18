import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppConfigService } from 'src/app/app-config.service';

import { CollectionWidgetComponent } from './collection-widget.component';

const getConfig = () => ({});

describe('CollectionWidgetComponent', () => {
  let component: CollectionWidgetComponent;
  let fixture: ComponentFixture<CollectionWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionWidgetComponent ],
      imports: [HttpClientTestingModule],
      providers: [{ provide: AppConfigService, useValue: { getConfig } }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
