import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ScicatAuthService } from '@shared/auth-services/scicat-auth.service';

@Component({
  selector: 'app-auth-callback',
  template: '',
  styles: [],
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scicatAuth: ScicatAuthService,
  ) {}

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const sub = this.route.queryParams.subscribe((params) => {
      const token = params['access-token'];
      const returnUrl = params['returnUrl'];

      if (token) {
        this.scicatAuth.setToken(token);
      }

      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
      } else {
        this.router.navigate(['/overview']);
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
