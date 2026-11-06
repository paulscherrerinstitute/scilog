import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class NavigationGuardService {
  // Suppresses the dashboard components' beforeunload warning for a navigation
  // the user already confirmed (e.g. the SciCat SSO redirect).
  suppressUnloadPrompt = false;

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    return (
      component.canDeactivate() ||
      confirm('You are about to leave the page. Do you want to continue?')
    );
  }
}
