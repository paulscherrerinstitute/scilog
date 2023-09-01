import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LogbookInfoService } from 'src/app/core/logbook-info.service';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class NavigationGuardService implements CanDeactivate<ComponentCanDeactivate> {

  constructor(private logbookInfo: LogbookInfoService) { }

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    const confirmResponse = confirm('You are about to leave the page. Do you want to continue?');
    if (confirmResponse) this.logbookInfo.logbookInfo = null;
    return component.canDeactivate() ? true : confirmResponse
  }
}
