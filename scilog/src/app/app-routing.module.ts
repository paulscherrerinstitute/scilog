import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './logbook/dashboard/dashboard.component';
import { TodosComponent } from './logbook/widgets/todos/todos.component';
import { LogbookItemComponent } from './logbook/widgets/logbook-item/logbook-item.component';
import { ChatComponent } from './logbook/widgets/chat/chat.component';
import { LoginComponent } from './login/login.component';
import { OverviewComponent } from './overview/overview.component';
import { LogbookComponent } from './logbook/logbook.component';
import { ChartComponent } from './logbook/widgets/chart/chart.component';
import { DashboardItemComponent } from './logbook/dashboard/dashboard-item/dashboard-item.component';
import { SnippetViewerComponent } from './logbook/widgets/snippet-viewer/snippet-viewer.component';
import { ViewSettingsComponent } from '@shared/settings/view-settings/view-settings.component';
import { ProfileSettingsComponent } from '@shared/settings/profile-settings/profile-settings.component';
import { DownloadComponent } from '@shared/download/download.component';
import { NavigationGuardService } from './logbook/core/navigation-guard-service';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'overview', component: OverviewComponent },
  { path: 'download/:fileId', component: DownloadComponent },
  { path: 'logbooks/:logbookId', component: LogbookComponent,
      children: [
        { path: 'dashboard', component: DashboardComponent, canDeactivate: [NavigationGuardService] },
        { path: 'todos', component: TodosComponent },
        { path: 'logbook', component: LogbookItemComponent },
        { path: 'snippetViewer', component: SnippetViewerComponent },
        { path: 'chat', component: ChatComponent },
        { path: 'graph', component: ChartComponent },
        { path: 'dashboard-item', component: DashboardItemComponent, canDeactivate: [NavigationGuardService] },
        { path: '**', redirectTo: '/overview', pathMatch: 'full' },
      ]},
  { path: 'viewSettings', component: ViewSettingsComponent, outlet: 'settings' },
  { path: 'profileSettings', component: ProfileSettingsComponent, outlet: 'settings' },
  { path: '**', redirectTo: '/overview', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', canceledNavigationResolution: 'computed' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

