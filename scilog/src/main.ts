import { enableProdMode, provideAppInitializer, inject, importProvidersFrom } from '@angular/core';


import { environment } from './environments/environment';
import { AppConfigService } from './app/app-config.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from '@shared/auth-services/auth.interceptor';
import { AuthService } from '@shared/auth-services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { JDENTICON_CONFIG } from 'ngx-jdenticon';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

const appConfigInitializerFn = (appConfig: AppConfigService) => {
    return () => appConfig.loadAppConfig();
};



if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule),
        AppConfigService,
        provideAppInitializer(() => {
            const initializerFn = (appConfigInitializerFn)(inject(AppConfigService));
            return initializerFn();
        }),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
            deps: [AuthService, Router],
        },
        CookieService,
        {
            // Custom identicon style
            provide: JDENTICON_CONFIG,
            useValue: {
                lightness: {
                    color: [0.31, 0.54],
                    grayscale: [0.63, 0.82],
                },
                saturation: {
                    color: 0.50,
                    grayscale: 0.50,
                },
                backColor: '#222',
            },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
