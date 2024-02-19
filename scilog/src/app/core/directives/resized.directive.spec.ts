import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';

import { ResizedDirective } from './resized.directive';
import { By } from '@angular/platform-browser';

@Component({
    template: `<div style="width: 10px" (resized)="hasBeenResized()"></div>`,
    imports: [ResizedDirective],
  })
class TestComponent {
  isResized = false;
  hasBeenResized() {
    this.isResized = true;
  }
}

describe('resizedDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let divElement: DebugElement;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
        declarations: [ResizedDirective, TestComponent],
    }).createComponent(TestComponent);
    component = fixture.componentInstance;
    divElement = fixture.debugElement.query(By.css('div'));
    fixture.detectChanges();
  });

  it('should respond to resize event', () => {
    expect(component.isResized).toEqual(false);
    divElement.triggerEventHandler('resized');
    expect(component.isResized).toEqual(true);
  });
});
