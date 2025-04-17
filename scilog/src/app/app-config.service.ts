import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";


export interface Oauth2Endpoint {
  displayText: string, 
  authURL: string, 
  displayImage?: string,
  tooltipText?: string,
}
export interface AppConfig {
  lbBaseURL?: string;
  oAuth2Endpoint?: Oauth2Endpoint;
  help?: string;
  scicatLbBaseURL?: string;
  scicatFrontendBaseURL?: string;
}

@Injectable()
export class AppConfigService {
  private appConfig: Object = {};

  constructor(private http: HttpClient) {}

  async loadAppConfig(): Promise<void> {
      try {
        this.appConfig = await this.http.get("/assets/config.json").toPromise();
      } catch (err) {
        console.error("No config provided, applying defaults", err);
      }
  }

  getConfig(): AppConfig {
    return this.appConfig as AppConfig;
  }
}
