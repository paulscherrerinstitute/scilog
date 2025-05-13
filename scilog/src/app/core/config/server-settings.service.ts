import { Injectable } from '@angular/core';
import { AppConfigService } from "../../app-config.service";

@Injectable({
  providedIn: 'root',
})
export class ServerSettingsService {
  constructor(private appConfigService: AppConfigService) {}

  getServerAddress() {
    return this.appConfigService.getConfig().lbBaseURL ?? 'http://[::1]:3000/';
  }

  getSciCatServerAddress(): string | undefined {
    return this.appConfigService.getScicatSettings()?.lbBaseURL;
  }

  getScicatLoginUrl(returnUrl: string): string {
    return `${this.getSciCatServerAddress()}/api/v3/auth/oidc?client=scilog&returnUrl=${returnUrl}`;
  }

  getScicatFrontendBaseUrl(): string | undefined {
    return this.appConfigService.getScicatSettings()?.frontendBaseURL;
  }

  getSocketAddress() {
    const lbBaseURL =
      this.appConfigService.getConfig().lbBaseURL ?? 'http://localhost:3000/';
    if (!lbBaseURL.startsWith('http'))
      throw new Error('BaseURL must use the http or https protocol');
    return `ws${lbBaseURL.substring(4)}`;
  }
}
