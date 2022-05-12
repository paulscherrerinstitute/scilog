import { Injectable } from '@angular/core';
import { AppConfigService } from "../../app-config.service";

@Injectable({
  providedIn: 'root'
})
export class ServerSettingsService {

  constructor(
    private appConfigService: AppConfigService,
  ) { }

  getServerAddress(){
    return this.appConfigService.getConfig().lbBaseURL || 'http://[::1]:3000/';
  }

  getSocketAddress(){
      return `ws://${this.appConfigService.getConfig().lbBaseURL.split('://').pop() || 'localhost:3000/'}`;
  }


}
