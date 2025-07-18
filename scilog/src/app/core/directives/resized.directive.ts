import { Directive, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';

export class ResizedEvent {
  public newRect: DOMRectReadOnly;
  public oldRect?: DOMRectReadOnly;
  public isFirst: boolean;

  public constructor(newRect: DOMRectReadOnly, oldRect: DOMRectReadOnly | undefined) {
      this.newRect = newRect;
      this.oldRect = oldRect;
      this.isFirst = oldRect == null;
  }
}

@Directive({ selector: '[appResized]' })
export class ResizedDirective implements OnInit, OnDestroy {
  private observer: ResizeObserver;
  private oldRect?: DOMRectReadOnly;

  @Output()
  public readonly appResized: EventEmitter<ResizedEvent>;

  public constructor(
    private readonly element: ElementRef,
    private readonly zone: NgZone
  )
  {
    this.appResized = new EventEmitter<ResizedEvent>();
    this.observer = new ResizeObserver(entries => this.zone.run(() => this.observe(entries)));
  }

  public ngOnInit(): void {
    this.observer.observe(this.element.nativeElement)
  }

  public ngOnDestroy(): void {
    this.observer.disconnect();
  }

  private observe(entries: ResizeObserverEntry[]): void {
    const domSize = entries[0];
    const resizedEvent = new ResizedEvent(domSize.contentRect, this.oldRect);
    this.oldRect = domSize.contentRect;
    this.appResized.emit(resizedEvent);
  }
}

