import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@shared/auth-services/auth.service';
import { afterLoginUrl, safeReturnUrl } from '@shared/auth-services/return-url';
import { AppConfig, AppConfigService, Oauth2Endpoint } from '../app-config.service';
import { DOCUMENT, NgIf } from '@angular/common';
import { MatCard, MatCardTitle, MatCardImage, MatCardContent } from '@angular/material/card';
import { MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    MatCard,
    MatCardTitle,
    MatCardImage,
    MatCardContent,
    MatTabGroup,
    NgIf,
    MatTab,
    MatTabLabel,
    MatTooltip,
    MatButton,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatIconButton,
    MatSuffix,
    MatIcon,
  ],
})
export class LoginComponent implements OnInit {
  hide = true;
  form: UntypedFormGroup;
  loginMessage = ' ';
  appConfig: AppConfig = this.appConfigService.getConfig();
  oAuth2Endpoint: Oauth2Endpoint;

  constructor(
    private appConfigService: AppConfigService,
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) public document: Document,
  ) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.oAuth2Endpoint = this.appConfig.oAuth2Endpoint;
  }

  ngOnInit(): void {
    if (this.authService.forceReload) {
      window.location.reload();
    }
    this.route.queryParams.subscribe((params) => {
      if (!!params.token) {
        this.authService.setSession({ token: params.token });
        this.returnToPage();
      }
    });
  }

  async login() {
    const val = this.form.value;
    if (val.email && val.password) {
      try {
        await this.authService.login(val.email, val.password).toPromise();
        console.log('User is logged in');
        this.returnToPage();
      } catch (error) {
        switch (error.statusText) {
          case 'Unknown Error':
            this.loginMessage = 'Authentication failed.';
            return;
          case 'Unauthorized':
            this.loginMessage = 'User name / email or password are not correct.';
            return;
          default:
            this.loginMessage = 'Authentication failed.';
            return;
        }
      }
    }
  }

  redirectOIDC(authURL: string) {
    const returnUrl = safeReturnUrl(this.route.snapshot.queryParams.returnUrl);
    const query = returnUrl ? `?${new URLSearchParams({ returnUrl })}` : '';
    this.document.location.href = `${this.appConfig.lbBaseURL}/${authURL}/login${query}`;
  }

  private returnToPage() {
    this.router.navigateByUrl(afterLoginUrl(this.route.snapshot.queryParams.returnUrl), {
      replaceUrl: true,
    });
  }
}
