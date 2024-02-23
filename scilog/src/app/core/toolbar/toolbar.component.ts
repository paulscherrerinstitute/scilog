import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth-services/auth.service';
import { Hotkeys } from '../hotkeys.service';
import { LogbookInfoService } from '../logbook-info.service';
import { UserPreferencesService } from '../user-preferences.service';
import { ViewsService } from '../views.service';
import { UserInfo } from '@model/user-info';
import { Views } from '@model/views';
import { SettingsComponent } from '@shared/settings/settings.component'
import { WidgetConfig } from '@model/config';
import { SearchWindowComponent } from '@shared/search-window/search-window.component';
import { AppConfigService, AppConfig } from 'src/app/app-config.service';
import { CookiesService } from '../cookies.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input()
  showMenuIcon: boolean;

  subscriptions: Subscription[] = [];
  logbookName: string;
  isLogbookOpen = false;
  avatarHash: string = "UserHash";
  username: string;
  showVersionInfo = true;
  versionInfo = 'BETA';
  currentView: string = "";
  showSearch = false;
  config: WidgetConfig[];

  @Output() openMenu = new EventEmitter<any>();
  
  private logbookTitleRef: ElementRef;
  @ViewChild('logbookTitle', { static: false }) set content(content: ElementRef) {
    if(content) { // initially setter gets called with undefined
      console.log(content)
        this.logbookTitleRef = content;
        this.adjustHeaderFontSize(this.logbookTitleRef);
    }
 }

 @ViewChild('searchWindow') searchWindow: SearchWindowComponent;

  views: Views[] = [];
  appConfig: AppConfig = this.appConfigService.getConfig();

  constructor(
    private appConfigService: AppConfigService,
    private authService: AuthService,
    private dialog: MatDialog,
    private logbookService: LogbookInfoService,
    private userPreferences: UserPreferencesService,
    private viewService: ViewsService,
    private hotkeys: Hotkeys,
    private cookie: CookiesService
    ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.logbookService.currentLogbookInfo.subscribe(logbook => {
      if ((logbook != null) && (logbook.name != '')){
        this.logbookName = logbook.name;
        this.isLogbookOpen = true;
      } else {
        this.isLogbookOpen = false;
      }
    }))
    this.subscriptions.push(this.userPreferences.currentUserInfo.subscribe((userInfo:UserInfo)=>{
      this.avatarHash = userInfo.email;
      this.username = userInfo.username;
      console.log(this.avatarHash)
    }));
    this.subscriptions.push(this.viewService.currentWidgetConfigs.subscribe((config:WidgetConfig[])=> {
      this.config = config;
      this.views = this.viewService.views;
      if (this.viewService.view != null){
        this.currentView = this.viewService.view.id;
      } else {
        this.currentView = "";
      }
      console.log(this.currentView);
    }))

    this.subscriptions.push(this.hotkeys.addShortcut({ keys: 'shift.control.f', description: { label: 'Search snippets', group: "General" } }).subscribe(() => {
      this.openSearch();
    }));
    this.showVersionInfo = !this.showMenuIcon;
    console.log(this.showVersionInfo)
    
  }


  logout() {
    console.log("logout");
    this.cookie.idToken = localStorage.getItem('id_token');
    this.authService.logout();
    location.href = `${this.appConfig.lbBaseURL}/${this.appConfig.oAuth2Endpoint.authURL}/logout`;
  }

  openSideMenu() {
    console.log("open menu");
    this.openMenu.emit();
  }

  openSettings() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.disableClose = true;
    dialogConfig.data = "profileSettings";
    const dialogRef = this.dialog.open(SettingsComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().subscribe(data => {
      console.log(data);
    }));
  }

  openViewSettings() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.disableClose = true;
    dialogConfig.data = "viewSettings";
    const dialogRef = this.dialog.open(SettingsComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().subscribe(data => {
      console.log(data);
      console.log(this.views)
    }));
  }

  openSearch(){
    this.showSearch = true;
  }

  closeSearch(){
    this.showSearch = false;
    this.searchWindow.reset();
  }

  selectedSearchEntry($event){
    
  }

  loadView(index: number){
    console.log("loading view: ", index);
    this.viewService.setView(index);
  }

  isOverflown(element: ElementRef) {
    return ((element.nativeElement.scrollHeight > element.nativeElement.clientHeight) || (element.nativeElement.scrollWidth > element.nativeElement.clientWidth));
  }

  adjustHeaderFontSize(element: ElementRef) {
    // console.log(element)
    let fontSize = parseInt(element.nativeElement.style.fontSize);
    for (let i = fontSize; i >= 0; i--) {
      let overflow = this.isOverflown(element);
      // console.log(overflow)
      if (overflow) {
        fontSize--;
        element.nativeElement.style.fontSize = fontSize + "px";
      }
    }
  }

  openHelp(){
    // for now, just open the hotkey table
    this.hotkeys.openHelpModal();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach(sub =>{
      sub.unsubscribe();
    })
  }
}
