import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class NavigationGuardService {
  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    return (
      component.canDeactivate() ||
      confirm('You are about to leave the page. Do you want to continue?')
    );
  }
}
