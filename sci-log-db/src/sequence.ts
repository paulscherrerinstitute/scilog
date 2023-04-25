import {AuthenticateFn, AuthenticationBindings} from '@loopback/authentication';
import {CoreBindings, inject} from '@loopback/core';
import {
  ExpressRequestHandler,
  FindRoute,
  InvokeMethod,
  InvokeMiddleware,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import session from 'express-session';
import cors from 'cors';
import {cookieToToken} from './express-handlers/cookie-to-token';
import {sessionStoreBuilder} from './session-store';
import {SciLogDbApplication} from './application';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;
  middlewareList: ExpressRequestHandler[];

  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) protected send: Send,
    @inject(SequenceActions.REJECT) protected reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    protected app: SciLogDbApplication,
  ) {
    this.middlewareList = [
      cors(),
      cookieToToken,
      session({
        secret: process.env.SESSION_SECRET ?? 'someSecret',
        resave: false,
        saveUninitialized: false,
        ...(process.env.SESSION_STORE_BUILDER
          ? {store: sessionStoreBuilder(app)}
          : {}),
      }) as ExpressRequestHandler,
    ];
  }

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const finished = await this.invokeMiddleware(
        context,
        this.middlewareList,
      );
      if (finished) return;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      await this.authenticateRequest(request);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
