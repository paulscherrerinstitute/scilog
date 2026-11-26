import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { ServerSettingsService } from '@shared/config/server-settings.service';

const SCICAT_TOKEN_KEY = 'scicat_token';

// Owns the SciCat token and the `loggedIn` state. Read and change them only
// through this service, not through localStorage, so the two stay in sync.
@Injectable({ providedIn: 'root' })
export class ScicatAuthService {
  private serverSettings = inject(ServerSettingsService);
  private location = inject(DOCUMENT).location;

  readonly loggedIn = signal(!!this.token);

  get token(): string | null {
    return localStorage.getItem(SCICAT_TOKEN_KEY);
  }

  // Start SSO with SciCat. This is a full-page redirect that returns to
  // `returnUrl`; with an existing Keycloak session it comes back automatically,
  // otherwise the user signs in to SciCat first.
  connect(returnUrl: string = this.location.pathname + this.location.search): void {
    this.location.href = this.serverSettings.getScicatLoginUrl(returnUrl);
  }

  setToken(token: string): void {
    localStorage.setItem(SCICAT_TOKEN_KEY, token);
    this.loggedIn.set(true);
  }

  markLoggedOut(): void {
    localStorage.removeItem(SCICAT_TOKEN_KEY);
    this.loggedIn.set(false);
  }
}
