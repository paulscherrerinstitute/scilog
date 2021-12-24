import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '@shared/auth-services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  hide = true;
  form: FormGroup;
  loginMessage = ' ';

  
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.forceReload){
      window.location.reload();
    }
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

}
