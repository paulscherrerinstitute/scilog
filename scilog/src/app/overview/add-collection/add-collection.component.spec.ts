import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCollectionComponent } from './add-collection.component';

describe('AddCollectionComponent', () => {
  let component: AddCollectionComponent;
  let fixture: ComponentFixture<AddCollectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
