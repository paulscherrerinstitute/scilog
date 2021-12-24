import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationButtonComponent } from './navigation-button.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { QueryParams } from '../../logbook/widgets/logbook-item/logbook-item.component.spec';
import { of } from 'rxjs';


describe('NavigationButtonComponent', () => {
  let component: NavigationButtonComponent;
  let fixture: ComponentFixture<NavigationButtonComponent>;
  let routerSpy: any;

  routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

  const queryParams = new QueryParams();
  queryParams.set('type', '?');

  const activatedRouteMock = {
    parent: { url: of(queryParams) },
    snapshot: { queryParams: {id: '1234'}}
 };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers:[
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerSpy},
      ],

      declarations: [ NavigationButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationButtonComponent);
    component = fixture.componentInstance;
    component["container"] = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
