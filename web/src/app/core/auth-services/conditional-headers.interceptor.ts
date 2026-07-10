import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IF_UNMODIFIED_SINCE } from '@shared/scicat.service';

@Injectable()
export class ConditionalHeadersInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const ifUnmodifiedSince = req.context.get(IF_UNMODIFIED_SINCE);
    if (ifUnmodifiedSince) {
      req = req.clone({
        headers: req.headers.set('If-Unmodified-Since', ifUnmodifiedSince),
      });
    }
    return next.handle(req);
  }
}
