import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css'],
    standalone: false
})
export class ChatComponent implements OnInit {

  @Input()
  configIndex: number;
  
  array: any;

  subscriptions: Subscription[] = [];

  constructor() { }

  ngOnInit(): void {

    // let params = new HttpParams();
    // params = params.set('filter', JSON.stringify({ "order": ["creationTime ASC"], "where": { "or": [{ "snippetType": "paragraph" }, { "snippetType": "image" }], "parentId": "5f5631c73f870c539a9549ad" }, "include": [{ "relation": "subsnippets" }] }));
    // console.log(params);
    // let headers = new HttpHeaders();
    // headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    // this.subscriptions.push(this.http.get(this.serverSettings.getServerAddress() + 'basesnippets', { headers: headers, params: params }).subscribe(data => {
    //   console.log(data);
    //   this.array = JSON.parse(JSON.stringify(data));

    // }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }

}
