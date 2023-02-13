import { Injectable } from '@angular/core';
import {CookieService} from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CookiesService {

  _lastLogbook: string;
  _lastView: string;

  constructor(private cookieService: CookieService) { 
    
  }

  set lastLogbook(id: string){
    this.cookieService.set('scilog-logbook', id);
    this._lastLogbook = id;
  }

  get lastLogbook(){
    this._lastLogbook = this.cookieService.get('scilog-logbook');
    return this._lastLogbook;
  }

  set lastView(id: string){
    this.cookieService.set('scilog-view', id);
    this._lastView = id;
  }

  get lastView(){
    this._lastLogbook = this.cookieService.get('scilog-view');
    return this._lastView;
  }

  set idToken(token: string) {
    this.cookieService.set('id_token', token);
  }

}
