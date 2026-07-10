import { HttpContext, HttpHandler, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { ConditionalHeadersInterceptor } from './conditional-headers.interceptor';
import { IF_UNMODIFIED_SINCE } from '@shared/scicat.service';

describe('ConditionalHeadersInterceptor', () => {
  let interceptor: ConditionalHeadersInterceptor;
  let mockNext: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    interceptor = new ConditionalHeadersInterceptor();
    mockNext = jasmine.createSpyObj('HttpHandler', ['handle']);
    mockNext.handle.and.returnValue(of(null));
  });

  it('should add If-Unmodified-Since header when context token is set', () => {
    const testTimestamp = '2023-01-01T00:00:00.000Z';
    const req = new HttpRequest('GET', '/test', {
      context: new HttpContext().set(IF_UNMODIFIED_SINCE, testTimestamp),
    });

    interceptor.intercept(req, mockNext);

    const passedReq: HttpRequest<unknown> = mockNext.handle.calls.mostRecent().args[0];
    expect(passedReq.headers.get('If-Unmodified-Since')).toBe(testTimestamp);
  });

  it('should not add If-Unmodified-Since header when context token is not set', () => {
    const req = new HttpRequest('GET', '/test');

    interceptor.intercept(req, mockNext);

    const passedReq: HttpRequest<unknown> = mockNext.handle.calls.mostRecent().args[0];
    expect(passedReq.headers.get('If-Unmodified-Since')).toBeNull();
  });
});
