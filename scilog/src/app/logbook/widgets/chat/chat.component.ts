import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgFor } from '@angular/common';
import { SnippetComponent } from '../../core/snippet/snippet.component';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css'],
    imports: [NgFor, SnippetComponent, MatInput, MatIconButton, MatIcon]
})
export class ChatComponent implements OnInit, OnDestroy {

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
