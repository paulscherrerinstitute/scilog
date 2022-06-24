import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '@shared/auth-services/auth.service';
import { AppConfig, AppConfigService } from '../app-config.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  hide = true;
  form: FormGroup;
  loginMessage = ' ';
  appConfig: AppConfig = this.appConfigService.getConfig();
  oAuth2Endpoint: {displayText: string, authURL: string, displayImage?: string};

  
  constructor(
    private appConfigService: AppConfigService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) public document: Document,
    ) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.oAuth2Endpoint = this.appConfig.oAuth2Endpoint;
  }

  ngOnInit(): void {
    if (this.authService.forceReload){
      window.location.reload();
    }
    this.route.queryParams.subscribe((params) => {
      if (!!params.token) {
        this.authService.setSession({token: params.token})
        this.router.navigateByUrl('/overview');
      }
    })
  }

  async login() {
    const val = this.form.value;
    if (val.email && val.password) {
      try {
        let data = await this.authService.login(val.email, val.password).toPromise();
        console.log(data);
        console.log("User is logged in");
        this.router.navigateByUrl('/overview');
      } catch (error) {
        switch (error.statusText) {
          case "Unknown Error":
            this.loginMessage = 'Authentication failed.'
            return;
          case "Unauthorized":
            this.loginMessage = 'User name / email or password are not correct.'
            return;
          default:
            this.loginMessage = 'Authentication failed.'
            return;
        }
      }
    }
  }

  redirectOIDC(authURL: string) {
    this.document.location.href = `${this.appConfig.lbBaseURL}/${authURL}`;
  }

}
