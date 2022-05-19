import {
    get,
    RestBindings,
    Response,
    param,
    RequestWithSession,
  } from '@loopback/rest';
import {authenticate, AuthenticationBindings, TokenService} from '@loopback/authentication';
import {inject, intercept} from '@loopback/core';
import { mapProfile } from '../authentication-strategies/types';
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
  @get('/auth/thirdparty/{provider}')
  /**
   * This method uses the @authenticate decorator to plugin passport strategies independently
   *
   * Endpoint: '/auth/thirdparty/{provider}'
   *          an endpoint for api clients to login via a third party app, redirects to third party app
   */
  loginToThirdParty(
    @param.path.string('provider') provider: string,
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL)
    redirectUrl: string,
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS)
    status: number,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    response.statusCode = status || 302;
    response.setHeader('Location', redirectUrl);
    response.end();
    return response;
  }

  @intercept('passport-oidc')
  @get('/auth/{provider}/callback',  
  )
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
    @inject('oidcOptions') oidcOptions: any,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    if (!request.user)
      throw new Error('user not found from request');
    const userProfile = mapProfile(request.user as User);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    response.redirect(`${oidcOptions.successRedirect}?token=${token}`);
    return response;

  }

}
