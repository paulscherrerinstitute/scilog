import { Injectable } from "@angular/core";
import { Logbooks } from "../core/model/logbooks";
import { UserPreferencesService } from "../core/user-preferences.service";
import { ChangeStreamNotification } from "../logbook/core/changestreamnotification.model";


@Injectable({
  providedIn: 'root'
})
export class IsAllowedService {
  tooltips: {
    update?: string,
    delete?: string,
    ownerGroup?: string,
    edit?: string,
    expired?: string,
  } = {};
  snippet: Logbooks | ChangeStreamNotification;

  constructor(private userPreferences: UserPreferencesService){}

  isNotExpired() {
    const expiresAt =  new Date(this.snippet.expiresAt);
    if (expiresAt > new Date()) return true
    const expiresString = expiresAt.toLocaleDateString(
        'en-GB', 
        {year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}
        );
    this.tooltips.expired = `Editing time (${expiresString}) has passed`;
    return false
  }

  private otherEnabledMembers(action: string): string[] {
    const aclMembers = (this.snippet?.[`${action}ACL`] ?? []).filter(
        (m: string) => m != 'admin').concat('admin');
    if (this.userPreferences.userInfo?.roles.some((entry: string) =>
      aclMembers?.includes?.(entry)
    ))
      return [];
    return aclMembers;
  }

  isUserAllowed(action: string) {
    const aclMembers = this.otherEnabledMembers(action);
    if (aclMembers.length === 0)
      return true;
    this.tooltips[action] = `Enabled for members of '${aclMembers}'`;
    return false
  }

  isAnyEditAllowed() {
    const groups = ['update', 'delete'].reduce((previousValue, currentValue) => 
      previousValue.concat(this.otherEnabledMembers(currentValue)),
      []
    )
    if (groups.length === 0)
      return true
    this.tooltips.edit = `Enabled for members of '${[...new Set(groups)]}'`;
    return false
  }

  isAdmin() {
    return this.isMemberOf('admin');
  }

  isMemberOf(action: string) {
    return this.otherEnabledMembers(action).length === 0;
  }

  canChangeOwnerGroup() {
    const adminMembers = this.otherEnabledMembers('admin');
    if (!this.snippet.ownerGroup || adminMembers.length === 0)
      return true
    this.tooltips.ownerGroup = `Only members of '${adminMembers}' can change the ownerGroup`;
    return false
  }

  canUpdate(checkExpiration = true) {
    return this.cascadeExpiration('update', checkExpiration)
  }

  private cascadeExpiration(action: string, checkExpiration: boolean) {
    const allowed = this.isUserAllowed(action);
    if (checkExpiration && this.tooltips.expired)
      this.tooltips[action] = this.tooltips.expired;
    return allowed;
  }

  canDelete(checkExpiration = true) {
    return this.cascadeExpiration('delete', checkExpiration)
  }
}
