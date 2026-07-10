import { Injectable } from '@angular/core';
import { shareReplay, timeout } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { AuthDataService } from '@shared/remote-data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  forceReload = false;
  constructor(private dataService: AuthDataService) {}

  login(principal: string, password: string) {
    return this.dataService.login(principal, password).pipe(
      timeout(3000),
      tap((res) => {
        this.setSession(res);
      }),
      shareReplay(),
    );
  }

  setSession(authResult) {
    console.log(authResult);
    // it would be good to get an expiration date for the token...
    localStorage.setItem('id_token', authResult.token);
    localStorage.setItem('id_session', this.getRandomId());
  }

  logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('id_session');
    localStorage.removeItem('scicat_token');
    sessionStorage.removeItem('scilog-auto-selection-logbook');
    this.forceReload = true;
  }

  getRandomId() {
    return Math.floor(Math.random() * 1000 + 1).toString();
  }

  getScilogToken(): string | null {
    return localStorage.getItem('id_token');
  }
}
