import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChangeStreamNotification } from './changestreamnotification.model';
import {ServerSettingsService} from '@shared/config/server-settings.service';
import { Subject, Subscriber } from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import {SnackbarService} from '@shared/snackbar.service';
import { WidgetItemConfig } from '@model/config';

export interface Message {
  author: string;
  message: string;
}

@Injectable()
export class ChangeStreamService {


  public messages: Subject<Message>;
  private websocketTimeout: any;
  private serverMessageShown: boolean;
  private restartTimeout: any = null;
  private config: WidgetItemConfig = null;
  // private subject: WebSocketSubject<unknown>;
  constructor(
    private serverSettings: ServerSettingsService, private snackBar: SnackbarService) { }


    startWebsocket(observer:any, logbookId:string){
      let subject = webSocket(this.serverSettings.getSocketAddress());
      subject.subscribe(
        data =>{
        if (data.hasOwnProperty('new-notification')){
          notificationParser(data['new-notification'], observer);
        } else if (data.hasOwnProperty('ping')){
          // console.log(data);
          clearTimeout(this.websocketTimeout);
          this.websocketTimeout = setTimeout(() => {
            console.log(this.websocketTimeout);
            console.log("timeout reached");
            this.snackBar.showServerMessage();
            this.serverMessageShown = true;
            subject.complete();
            console.log("restarting websocket")
            this.startWebsocket(observer, logbookId); 
          }, 30000);
          if (this.serverMessageShown){
            this.snackBar.hideServerMessage();
          }
        } else {
          console.log("unhandled websocket data: ", data);
        }
      },
      err => {
        if (this.restartTimeout == null){
          this.restartTimeout = setTimeout(()=>{
            this.restartTimeout = null;
            console.log(err);
            this.serverMessageShown = true;
            this.snackBar.showServerMessage();
            subject.complete();
            this.startWebsocket(observer, logbookId);
          }, 10000);
        }

      });
      subject.next({message: {'join': logbookId, 'token': localStorage.getItem('id_token'), 'config': this.config}})  
      return subject;
    }

  getNotification(logbookId: string, config: WidgetItemConfig): Observable<ChangeStreamNotification> {
    
    let observable = new Observable<ChangeStreamNotification>(observer => {
      // console.log("Subscribing to logbook: ", logbookId);
      this.config = config;
      let subject = this.startWebsocket(observer, logbookId);

      return () => {
        // this.socket.disconnect();
        subject.complete();
      };  
    })     
    return observable;
  }  

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log("destroyed");
    clearTimeout(this.websocketTimeout);
    clearTimeout(this.restartTimeout);
  }
}

function notificationParser(data:any, observer:any){
  
    console.log(data);
    let notification: ChangeStreamNotification = {
      id: <string>data.documentKey._id,
      operationType: data.operationType,
      };

    // console.log(data.operationType)
    switch (data.operationType) {
      case "update":
        console.log("update");
        console.log(data);
        notification.content = data.updateDescription.updatedFields;
        
        break;
      case "insert":
        console.log("full document");
        notification.content = data.fullDocument;
        if (data.fullDocument._id){
          notification.content.id = data.fullDocument._id;
          delete notification.content._id;
        }
        console.log(notification);
        break;
      case "delete":
        // console.log("delete");
        break;
      default:
        break;
    }
    observer.next(notification);    
}