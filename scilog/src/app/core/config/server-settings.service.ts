import { Injectable } from '@angular/core';
import { AppConfigService } from "../../app-config.service";

@Injectable({
  providedIn: 'root'
})
export class ServerSettingsService {
  appConfig = this.appConfigService.getConfig();

  constructor(
    private appConfigService: AppConfigService,
  ) { }

  getServerAddress(){
    return this.appConfig.lbBaseURL || 'http://[::1]:3000/';
  }

  getSocketAddress(){
      return `ws://${this.appConfig.lbBaseURL.split('://').pop() || 'localhost:3000/'}`;
  }


}
