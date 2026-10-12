import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { loginUrl } from './return-url';

/** Sends users without a session to the login page, remembering where they wanted to go. */
export const authGuard: CanActivateChildFn = (_childRoute, state) =>
  inject(AuthService).getScilogToken() ? true : inject(Router).parseUrl(loginUrl(state.url));
