import { enableProdMode, provideAppInitializer, inject, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { AppConfigService } from './app/app-config.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from '@shared/auth-services/auth.interceptor';
import { AuthService } from '@shared/auth-services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { JDENTICON_CONFIG, NgxJdenticonModule } from 'ngx-jdenticon';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GridsterModule } from 'angular-gridster2';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgChartsModule } from 'ng2-charts';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { UiScrollModule } from 'ngx-ui-scroll';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { AppComponent } from './app/app.component';

const appConfigInitializerFn = (appConfig: AppConfigService) => {
    return () => appConfig.loadAppConfig();
};



if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, MatButtonModule, MatCardModule, MatDialogModule, MatExpansionModule, MatIconModule, MatProgressSpinnerModule, MatSidenavModule, CKEditorModule, ScrollingModule, DragDropModule, MatMenuModule, MatChipsModule, MatFormFieldModule, MatToolbarModule, MatTableModule, MatButtonToggleModule, GridsterModule, MatDividerModule, MatBadgeModule, ReactiveFormsModule, MatInputModule, NgChartsModule, MatTooltipModule, MatSelectModule, MatRadioModule, MatCheckboxModule, FormsModule, MatSlideToggleModule, MatAutocompleteModule, NgxJdenticonModule, MatTabsModule, UiScrollModule, MatProgressBarModule, MatSnackBarModule, MatTableModule, MatPaginatorModule, MatSortModule, CdkDrag, CdkDropList),
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
