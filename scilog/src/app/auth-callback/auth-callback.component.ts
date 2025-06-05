import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-auth-callback',
    template: '',
    styles: [],
    standalone: false
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private router: Router) {}

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const sub = this.route.queryParams.subscribe((params) => {
      const token = params['access-token'];
      const returnUrl = params['returnUrl'];

      if (token) {
        localStorage.setItem('scicat_token', token);
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
