import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SnippetComponent } from '@shared/snippet/snippet.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSidenavModule} from '@angular/material/sidenav';
import {BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {HttpClientModule} from '@angular/common/http';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import { AddContentComponent } from '@shared/add-content/add-content.component';
import {MatMenuModule} from '@angular/material/menu'; 
import {MatChipsModule} from '@angular/material/chips'; 
import {MatFormFieldModule} from '@angular/material/form-field'; 
import {MatToolbarModule} from '@angular/material/toolbar';
import { SnippetTableComponent } from '@shared/snippet/snippet-table/snippet-table.component'
import {MatTableModule} from '@angular/material/table'; 
import {MatButtonToggleModule} from '@angular/material/button-toggle'; 
import {GridsterModule} from 'angular-gridster2';
import { DashboardItemComponent } from './logbook/dashboard/dashboard-item/dashboard-item.component';
import { LogbookItemComponent } from './logbook/widgets/logbook-item/logbook-item.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatBadgeModule} from '@angular/material/badge';
import { DashboardComponent } from './logbook/dashboard/dashboard.component';
import { ChatComponent } from './logbook/widgets/chat/chat.component';
import { TodosComponent } from './logbook/widgets/todos/todos.component';
import { ChartComponent } from './logbook/widgets/chart/chart.component';
import { LoginComponent } from './login/login.component';
import { OverviewComponent } from './overview/overview.component';
import { LogbookComponent } from './logbook/logbook.component';
import { LogbookWidgetComponent } from './overview/logbook-cover/logbook-cover.component';
import { ViewWidgetComponent } from './overview/view-widget/view-widget.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {AuthInterceptor} from '@shared/auth-services/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToolbarComponent } from '@shared/toolbar/toolbar.component';
import { ChartsModule } from 'ng2-charts';
import {MatTooltipModule} from '@angular/material/tooltip';
import { WidgetPreferencesComponent } from './logbook/widgets/widget-preferences/widget-preferences.component'; 
import { MatSelectModule } from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio'; 
import {MatCheckboxModule} from '@angular/material/checkbox';
import { SettingsComponent } from '@shared/settings/settings.component';
import { CollectionWidgetComponent } from './overview/collection-widget/collection-widget.component'; 
import { AuthService } from '@shared/auth-services/auth.service';
import { Router } from '@angular/router';
import { AddLogbookComponent } from './overview/add-logbook/add-logbook.component';
import { AddCollectionComponent } from './overview/add-collection/add-collection.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle'; 
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { LogbookSearchPipe } from './overview/logbook-search.pipe';
import { NavigationButtonComponent } from './logbook/navigation-button/navigation-button.component'; 
import { AngularResizedEventModule } from 'angular-resize-event';
import { SnippetContentComponent } from '@shared/snippet/snippet-content/snippet-content.component';
import {CookieService} from 'ngx-cookie-service';
import { NgxJdenticonModule, JDENTICON_CONFIG } from 'ngx-jdenticon';
import { SnippetViewerComponent } from './logbook/widgets/snippet-viewer/snippet-viewer.component';
import { SnippetDashboardNameComponent } from '@shared/snippet/snippet-dashboard-name/snippet-dashboard-name.component';
import { ViewSettingsComponent } from '@shared/settings/view-settings/view-settings.component';
import { ProfileSettingsComponent } from '@shared/settings/profile-settings/profile-settings.component';
import { ViewEditComponent } from '@shared/settings/view-settings/view-edit/view-edit.component';
import {MatTabsModule} from '@angular/material/tabs';
import { TagEditorComponent } from '@shared/tag-editor/tag-editor.component';
import { SnippetInfoComponent } from '@shared/snippet/snippet-info/snippet-info.component';
import { SnippetInfoSectionComponent } from '@shared/snippet/snippet-info/snippet-info-section/snippet-info-section.component'; 
import { UiScrollModule } from 'ngx-ui-scroll';
import { HotkeysComponent } from '@shared/hotkeys/hotkeys.component';
import { ExportDialogComponent } from './logbook/dashboard/dashboard-item/export-dialog/export-dialog.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { DownloadComponent } from '@shared/download/download.component';
import { SearchComponent } from '@shared/search/search.component';
import { SearchWindowComponent } from '@shared/search-window/search-window.component';

@NgModule({
  declarations: [
    AppComponent,
    SnippetComponent,
    AddContentComponent,
    SnippetTableComponent,
    DashboardItemComponent,
    LogbookItemComponent,
    DashboardComponent,
    ChatComponent,
    TodosComponent,
    ChartComponent,
    LoginComponent,
    OverviewComponent,
    LogbookComponent,
    LogbookWidgetComponent,
    ViewWidgetComponent,
    ToolbarComponent,
    WidgetPreferencesComponent,
    SettingsComponent,
    CollectionWidgetComponent,
    AddLogbookComponent,
    AddCollectionComponent,
    LogbookSearchPipe,
    NavigationButtonComponent,
    SnippetContentComponent,
    SnippetViewerComponent,
    SnippetDashboardNameComponent,
    ViewSettingsComponent,
    ProfileSettingsComponent,
    ViewEditComponent,
    TagEditorComponent,
    SnippetInfoComponent,
    SnippetInfoSectionComponent,
    HotkeysComponent,
    ExportDialogComponent,
    DownloadComponent,
    SearchComponent,
    SearchWindowComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    CKEditorModule,
    HttpClientModule,
    ScrollingModule,
    DragDropModule,
    ExperimentalScrollingModule,
    MatMenuModule,
    MatChipsModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatTableModule,
    MatButtonToggleModule,
    GridsterModule,
    MatDividerModule,
    MatBadgeModule,
    ReactiveFormsModule,
    MatInputModule,
    ChartsModule,
    MatTooltipModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    FormsModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    AngularResizedEventModule,
    NgxJdenticonModule,
    MatTabsModule,
    UiScrollModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  entryComponents: [HotkeysComponent],
  providers: [
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
