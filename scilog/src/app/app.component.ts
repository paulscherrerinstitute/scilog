import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  light_mode = true;
  disable_log = false;

  constructor() {}

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

}
