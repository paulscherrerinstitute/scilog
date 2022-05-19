import {
  inject,
  Provider,
  Interceptor,
  InvocationContext,
  Next,
} from '@loopback/core';
import {
  // RestBindings,
  // RequestContext,
  toInterceptor,
  ExpressRequestHandler,
} from '@loopback/rest';

export class OIDCInterceptor implements Provider<Interceptor> {
  constructor(
    @inject('oidcStrategyMiddleware')
    public oidcStrategy: ExpressRequestHandler,
  ) {}

  value() {
    return async (invocationCtx: InvocationContext, next: Next) => {
      // const requestCtx = invocationCtx.getSync<RequestContext>(
      //   RestBindings.Http.CONTEXT,
      // );
      return toInterceptor(this.oidcStrategy)(invocationCtx, next);
    };
  }
}
