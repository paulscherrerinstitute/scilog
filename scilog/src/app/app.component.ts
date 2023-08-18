import { Component, HostListener, OnInit } from '@angular/core';
import { LogbookInfoService } from './core/logbook-info.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  light_mode = true;
  disable_log = false;

  constructor(private logbookInfo: LogbookInfoService) {
  }

  ngOnInit(): void {
    
    if (this.light_mode){
      document.body.classList.add('theme-light');
      localStorage.setItem('light-mode', 'true');
    } else {
      document.body.classList.add('theme-dark');
      localStorage.setItem('light-mode', 'false');
    }
    // this.document.body.classList.replace(this.currentTheme, newTheme)

    if (this.disable_log){
      console.log = function (){};
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: Event & {target: Window}) {
    if (event.target.location.pathname === '/overview')
      this.logbookInfo.logbookInfo = null;
  }

}
