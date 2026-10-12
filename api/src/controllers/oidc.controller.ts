import {
  get,
  RestBindings,
  Response,
  param,
  RequestWithSession,
} from '@loopback/rest';
import {
  authenticate,
  AuthenticationBindings,
  TokenService,
} from '@loopback/authentication';
import {inject, intercept} from '@loopback/core';
import {mapProfile, OIDCOptions} from '../authentication-strategies/types';
import {saveReturnUrl, takeReturnUrl} from '../utils/return-url';
import {TokenServiceBindings, User} from '@loopback/authentication-jwt';

/**
 * Login controller for third party oauth provider
 *
 * The method loginToThirdParty uses the @authenticate decorator to plugin passport strategies independently
 * The method thirdPartyCallBack uses the passport strategies as express middleware
 */
export class OIDCController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
  ) {}

  @authenticate('oidc')
  @get('/auth/{provider}/login')
  /**
   * This method uses the @authenticate decorator to plugin passport strategies independently
   *
   * Endpoint: '/auth/thirdparty/{provider}'
   *          an endpoint for api clients to login via a third party app, redirects to third party app
   */
  loginToThirdParty(
    @param.path.string('provider') provider: string,
    @param.query.string('returnUrl', {
      description: 'Page in the web app to return to after login',
    })
    returnUrl: string | undefined,
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL)
    redirectUrl: string,
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS)
    status: number,
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    saveReturnUrl(request.session, returnUrl);
    response.statusCode = status || 302;
    response.setHeader('Location', redirectUrl);
    response.end();
    return response;
  }

  @intercept('passport-oidc')
  @get('/auth/{provider}/callback')
  /**
   * This method uses the passport strategies as express middleware
   *
   * Endpoint: '/auth/{provider}/callback'
   *          an endpoint which serves as a oauth2 callback for the thirdparty app
   *          this endpoint sets the user profile in the session
   */
  async thirdPartyCallBack(
    @param.path.string('provider') provider: string,
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject('oidcOptions') oidcOptions: OIDCOptions,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    if (!request.user) throw new Error('user not found from request');
    const userProfile = mapProfile(request.user as User);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    const returnUrl = takeReturnUrl(request.session);
    const returnUrlParam = returnUrl
      ? `&returnUrl=${encodeURIComponent(returnUrl)}`
      : '';
    response.redirect(
      `${oidcOptions.successRedirect}?token=${token}${returnUrlParam}`,
    );
    return response;
  }

  @authenticate('jwt')
  @get('/auth/{provider}/logout')
  async logout(
    @param.path.string('provider') provider: string,
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject('oidcOptions') oidcOptions: OIDCOptions,
  ) {
    await request.session.destroy();
    response.clearCookie('id_token');
    response.clearCookie('connect.sid');
    response.redirect(
      `${oidcOptions.endSessionEndpoint}?post_logout_redirect_uri=${oidcOptions.postLogoutRedirectUri}&client_id=${oidcOptions.clientID}`,
    );
    return response;
  }
}
