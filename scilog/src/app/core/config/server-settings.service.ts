import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerSettingsService {

  constructor() { }

  public serverType: string = "kwHome";

  getServerAddress(){
    switch (this.serverType) {
      case "production":
        return "https://lnode2.psi.ch/api/v1/";
      case "kwHome":
        return "http://[::1]:3000/"; 
      default:
        break;
    }
  }

  getSocketAddress(){
    switch (this.serverType) {
      case "production":
        return 'wss://lnode2.psi.ch/api/v1';
      case "kwHome":
        return "ws://localhost:3000/"; 
      default:
        break;
    }
  }


}
