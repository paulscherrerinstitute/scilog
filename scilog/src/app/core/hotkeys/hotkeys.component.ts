import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-hotkeys',
  templateUrl: './hotkeys.component.html',
  styleUrls: ['./hotkeys.component.css']
})
export class HotkeysComponent implements OnInit {

  hotkeys = Array.from(this.data);
  hotkeysSorted:Object = {};
  hotkeyGroups: string[];
  help: string;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private appConfigService: AppConfigService,
  ) { 
    this.help = this.appConfigService.getConfig().help ?? "";
  }

  ngOnInit() { 
    
    this.hotkeys.forEach((entry:any)=>{
      let tmp = {key: entry[0], label: entry[1]["label"]};
      if (this.hotkeysSorted[entry[1]["group"]]){
        this.hotkeysSorted[entry[1]["group"]].push(tmp)
      } else {
        this.hotkeysSorted[entry[1]["group"]] = [tmp];
      }
    });

    this.hotkeyGroups = Object.keys(this.hotkeysSorted);
  }

}
