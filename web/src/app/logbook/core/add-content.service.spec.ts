import { TestBed } from '@angular/core/testing';

import { AddContentService } from './add-content.service';

describe('AddContentService', () => {
  let service: AddContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should deliver a message only to the matching widget', () => {
    const firstHandler = jasmine.createSpy('firstHandler');
    const secondHandler = jasmine.createSpy('secondHandler');
    const firstSubscription = service.handleMessages('widget-1', firstHandler);
    const secondSubscription = service.handleMessages('widget-2', secondHandler);
    const message = { textcontent: 'comment' };

    service.changeMessage(message, 'widget-2');

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledOnceWith(message);
    firstSubscription.unsubscribe();
    secondSubscription.unsubscribe();
  });

  it('should not replay a message to later subscribers', () => {
    const message = { textcontent: 'comment' };
    const lateHandler = jasmine.createSpy('lateHandler');

    service.changeMessage(message, 'widget-1');
    const subscription = service.handleMessages('widget-1', lateHandler);

    expect(lateHandler).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should not route a message without an origin ID', () => {
    const handler = jasmine.createSpy('handler');
    const subscription = service.handleMessages('widget-1', handler);
    spyOn(console, 'warn');

    service.changeMessage({ textcontent: 'comment' });

    expect(handler).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should not route a message with an unknown origin ID', () => {
    const handler = jasmine.createSpy('handler');
    const subscription = service.handleMessages('widget-1', handler);

    service.changeMessage({ textcontent: 'comment' }, 'unknown-widget');

    expect(handler).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should stop routing after a widget unsubscribes', () => {
    const handler = jasmine.createSpy('handler');
    const subscription = service.handleMessages('widget-1', handler);
    subscription.unsubscribe();

    service.changeMessage({ textcontent: 'comment' }, 'widget-1');

    expect(handler).not.toHaveBeenCalled();
  });
});
