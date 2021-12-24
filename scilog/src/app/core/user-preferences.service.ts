import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CollectionConfig, UserPreferences } from '@model/config';
import { UserInfo } from '@model/user-info';
import { UserPreferencesDataService } from '@shared/remote-data.service';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {


  collectionConfigs: CollectionConfig[] = [];

  private collectionConfigSource = new BehaviorSubject(this.collectionConfigs);
  public currentCollectionsConfig = this.collectionConfigSource.asObservable();

  _userInfo: UserInfo = {};
  private userInfoSource = new BehaviorSubject(this._userInfo);
  public currentUserInfo = this.userInfoSource.asObservable();

  public userPreferences: UserPreferences;
  // public logbook: Logbooks = {};
  // public lastView: Views;

  subscriptions: Subscription[] = [];

  constructor(
    private dataService: UserPreferencesDataService) {

    this.subscriptions.push(this.dataService.getUserPreferences().subscribe({
      next: data => {
        if (data.length == 1) {
          console.log("UserPreferences:", data);
          this.userPreferences = data[0];
          this.collectionConfigs = data[0].collections;
        } else if (data.length > 1) {
          console.log("found more than one UserPreferences. Deleting older entries.")
          this.userPreferences = data.pop();
          this.collectionConfigs = this.userPreferences.collections;
          for (const pref of data) {
            this.deleteUserPreference(pref.id);
          }

        } else {
          console.log("uploading default user preferences");
          this.getDefaultUserPreferences();
          this.postUserPreferences();
        }

        this.collectionConfigSource.next(this.collectionConfigs);
      },
      error: error => {
        if (error?.statusText && error.statusText == 'Unauthorized') {
          console.log("unauthorized");
        } else if (error?.statusText && error.statusText == 'Unknown Error') {
          console.error('Please check the server connection.', error)
        } else {
          console.error('There was an error!', error)
        }
      }
    }));

    this._getUserInfo();
  }

  private async _getUserInfo(){
    this.userInfo = await this.dataService.getUserInfo();
  }

  public set userInfo(data:UserInfo){
    this._userInfo = data;
    this.userInfoSource.next(this.userInfo)
  }

  public get userInfo(): UserInfo {
    return this._userInfo;
  }

  private async postUserPreferences() {
    let data = await this.dataService.postUserPreferences(this.userPreferences);
    this.userPreferences[0].id = data.id;
    console.log(this.userPreferences);
  }

  private async deleteUserPreference(id: string) {
    await this.dataService.deleteUserPreferences(id);
  }

  getDefaultUserPreferences(): void {
    this.userPreferences = {
      collections: [{
        name: "All logbooks",
        description: "All logbooks",
        filter: ''
      }]
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();

    });
  }


}
