import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ResizedDirective } from './resized.directive';

@Component({
    template: `<div style="width: 10px" (resized)=hasBeenResized()></div>`,
    imports: [ResizedDirective],
  })
class TestComponent {
  resized = false;
  hasBeenResized() {
    this.resized = true;
  }
}

describe('resizedDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let divElement: DebugElement;
  let directive: DebugElement;
  let component: TestComponent;

  
  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
        declarations: [ResizedDirective, TestComponent],
    }).createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    divElement = fixture.debugElement.query(By.css('div'));
    directive = fixture.debugElement.query(By.directive(ResizedDirective));
  });

  it('should respond to resize event', async () => {
    expect(component.resized).toEqual(false);
    divElement.nativeElement.style.width = '20px';
    fixture.detectChanges();  
    fixture.whenStable().then(() => {
      expect(component.resized).toEqual(true);
    });
  });
});
