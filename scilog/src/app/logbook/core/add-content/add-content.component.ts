import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as ClassicEditor from '../ckeditor/ckeditor5/build/ckeditor';
import { ChangeEvent, CKEditorComponent } from '../ckeditor/ckeditor5/build/ckeditor';
import { AddContentService } from "../add-content.service";
import { ChangeStreamNotification } from "../changestreamnotification.model";
import { LinkType } from '@model/paragraphs';
import { Subscription, merge } from 'rxjs';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { HttpClient } from '@angular/common/http';
import { CK5ImageUploadAdapter } from '../ckeditor/ck5-image-upload-adapter';
import { Basesnippets, Filecontainer } from '@model/basesnippets';
import { v4 as uuid } from 'uuid';
import { CKeditorConfig } from '../ckeditor/ckeditor-config';

interface editorDataInput {
  snippet: ChangeStreamNotification,
  content: string,
  defaultTags: string[],
  config: any,
}

@Component({
  selector: 'add-content',
  templateUrl: './add-content.component.html',
  styleUrls: ['./add-content.component.css']
})
export class AddContentComponent implements OnInit {

  public Editor = ClassicEditor;
  public editorConfig: any = CKeditorConfig;

  data: any = '';
  message: any;
  notification: ChangeStreamNotification = {};
  liveFeedback: boolean;
  addButtonLabel: string;
  dialogTitle: string;

  modifiedMetadata = false;
  metadataPanelExpanded = false;
  tag: string[] = [];
  defaultTags: string[] = [];
  subsnippets: Basesnippets[] = [];
  subscriptions: Subscription[] = [];
  contentChanged: boolean = false;
  initialized: boolean = false;
  prel_fileStorage: any[] = [];
  config: any = [];

  constructor(
    private dataService: AddContentService,
    @Inject(MAT_DIALOG_DATA) data: editorDataInput,
    private logbookInfo: LogbookInfoService,
    private httpClient: HttpClient) {
    this.editorConfig["autosave"] = {
      save: (editor) => {
        return this.editorChange(editor);
      }
    }
    if (data != null) {
      this.message = data.snippet;
      this.config = data.config
      this.data = typeof data.content == "undefined" ? "" : data.content;
      if (typeof data.defaultTags != 'undefined') {
        this.tag = data.defaultTags
      }
      this.defaultTags = data.defaultTags;
      this.adjustContentForEditor();
      this.initialized = true;
      console.log(this.data);
    }
  }

  ngOnInit(): void {
    this.setupComponent()
    this.subscriptions.push(this.dataService.currentMessage.subscribe(message => {
      console.log(message);
      if (message != null) {
        // this.message = message;
      }
    }));
  }

  setupComponent() {
    if (!this.message) {
      this.data = '';
      this.liveFeedback = false;
      this.addButtonLabel = "Add";
      this.dialogTitle = "Add data snippet";
      if (this.logbookInfo.logbookInfo == null) {
        console.log("logbook cannot be null");
      } else {
        this.notification.parentId = this.logbookInfo.logbookInfo.id;
      }
      this.notification.linkType = LinkType.PARAGRAPH;
      console.log(this.notification)
      return;
    }

    if (this.message.id) {
      this.notification = this.message;
      this.liveFeedback = true;
      this.addButtonLabel = "Done";
      this.dialogTitle = "Modify data snippet";
      this.notification.linkType = LinkType.PARAGRAPH;
      return;
    }
    if (this.message.parentId) {
      this.data = '';
      this.liveFeedback = false;
      this.addButtonLabel = "Add";
      this.notification.parentId = this.message.parentId;

      if (this.message.linkType == LinkType.QUOTE) {
        this.dialogTitle = "Reply";
        this.notification.linkType = LinkType.QUOTE;
        console.log(this.message);
        this.notification.subsnippets = JSON.parse(JSON.stringify(this.message.subsnippets));
        this.prepareSubsnippetsQuoteContainer();

      } else {
        this.dialogTitle = "Add comment";
        this.notification.linkType = LinkType.COMMENT;
      }
    }
    return;
  }

  onEditorReady($event: any) {
    console.log(Array.from($event.ui.componentFactory.names()));
    $event.ui.getEditableElement().parentElement.insertBefore(
      $event.ui.view.toolbar.element,
      $event.ui.getEditableElement()
    );
    $event.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new CK5ImageUploadAdapter(loader, this.httpClient);
    };
    $event.editing.view.focus();
  };

  addContent($event: any) {
    console.log("adding new content");
    if (!this.liveFeedback) {
      this.prepareMessage(this.data);
      this.sendMessage();
    }
  };

  onChange({ editor }: ChangeEvent) {
    // this.editorChange(editor);
    this.contentChanged = true;
  }

  editorChange(editor: any): any {
    if (this.initialized) {
      if (typeof editor != "undefined") {
        const data = editor.getData();
        this.prel_fileStorage = editor['prel_fileStorage'];
        this.contentChanged = false;
        this.changeChain(data);
      }
    }
  }

  changeChain(data: any = null) {
    if (data != null) {
      if (this.liveFeedback) {
        console.log("changing content");
        this.prepareMessage(data);
        this.data = data;
        // this.notification.textcontent = data;
        this.sendMessage();
      } else {
        this.data = data;
      }
    } else {
      if (this.liveFeedback) {
        this.sendMessage();
      }
    }
  }

  prepareSubsnippetsQuoteContainer() {
    console.log(this.notification.subsnippets)
    delete this.notification.subsnippets[0]?.id;
    delete this.notification.subsnippets[0]?.parentId;
    delete this.notification.subsnippets[0]?.updatedAt;
    delete this.notification.subsnippets[0]?.updatedBy;
    delete this.notification.subsnippets[0]?.createdAt;
    delete this.notification.subsnippets[0]?.createdBy;
    delete this.notification.subsnippets[0]?.defaultOrder;
    delete this.notification.subsnippets[0]?.subsnippets;

    this.notification.subsnippets[0].linkType = LinkType.QUOTE;
    console.log(this.notification.subsnippets)
  }

  prepareMessage(data: string) {
    if (this.fileChanged(data)) {
      // update files
      console.log("files changed");
      let notification = extractNotificationMessage(data, true);
      if (notification != null) {
        this.notification.textcontent = notification.textcontent;
        this.notification.files = notification.files;
        this.notification.tags = this.tag;
      } else {
        this.notification.textcontent = "";
      }

    } else {
      // update textcontent only
      console.log("files did not change");
      let notification = extractNotificationMessage(data, false, this.message?.files ? this.message.files : []);
      console.log(notification)
      this.notification.textcontent = notification.textcontent;
      console.log(this.notification)
    }
    if (this.notification.linkType == LinkType.QUOTE) {
      console.log("preparing quote");
      // send paragraph and subsnippet (that is a copy of the reference);
      this.notification.linkType = LinkType.PARAGRAPH;
    }
  }

  fileChanged(data: string) {
    // console.log(data);
    // console.log(this.data);
    let fileHasChanged = false;

    var spanNew = document.createElement('figure');
    spanNew.innerHTML = data;
    let figuresNew = spanNew.querySelectorAll("figure");

    var spanOld = document.createElement('figure');
    spanOld.innerHTML = this.data;
    let figuresOld = spanOld.querySelectorAll("figure");

    console.log("figNew", figuresNew)
    console.log("figOld", figuresOld)
    if (figuresNew.length != figuresOld.length) {
      fileHasChanged = true;
      return fileHasChanged;
    }

    let figIndex = 0;
    while (figIndex < figuresNew.length) {
      if (typeof figuresNew[figIndex].firstChild['currentSrc'] != 'undefined') {
        let notSameSource = (figuresNew[figIndex].firstChild['currentSrc'] != figuresOld[figIndex].firstChild['href']);
        let notSameHref = (figuresNew[figIndex].firstChild['currentSrc'] != figuresOld[figIndex].firstChild['currentSrc']);
        let notSameLinkedSource = (figuresNew[figIndex].firstChild['currentSrc'] != figuresOld[figIndex].firstChild.firstChild['currentSrc']);
        if (notSameSource && notSameLinkedSource && notSameHref) {
          fileHasChanged = true;
          return fileHasChanged;
        }

      }
      figIndex++;
    }

    return fileHasChanged;
  }

  sendMessage() {
    console.log(this.notification);
    // this should not be here!
    this.notification.tags = this.tag;
    this.dataService.changeMessage(this.notification);
  }

  adjustContentForEditor() {

    var span = document.createElement('figure');
    span.innerHTML = this.data;
    let figures = span.querySelectorAll("figure");
    figures.forEach(fig => {
      console.log(fig);
      if ((typeof fig.firstChild['currentSrc'] != 'undefined') && fig.firstChild['currentSrc'] != "") {
        if ((fig.firstElementChild.getAttribute('width') != "") && fig.firstElementChild.getAttribute('width') != null) {
          fig.setAttribute("style", "width:" + fig.firstElementChild.getAttribute('width') + ";");
        }
        console.log(fig);
      }
    });
    this.data = span.innerHTML;

  }

  updateTags(tags: string[]) {
    this.tag = tags;
    this.changeChain();
  }

  toggleMetadataPanel() {
    this.metadataPanelExpanded = !this.metadataPanelExpanded;
  }

  ngOnDestroy(): void {
    console.log("deleting add-content subscriptions")
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }


}

export function extractNotificationMessage(htmlData: string, updateFiles: boolean = true, fileStorage: any = []) {

  console.log("extracting notification");

  let dataEditor = htmlData;
  var span = document.createElement('figure');
  span.innerHTML = dataEditor;

  console.log(span.innerHTML)

  let figures = span.querySelectorAll("figure");
  let snippetFiles: Filecontainer[] = [];

  let fileIndex = 0;
  figures.forEach(fig => {
    console.log(fig)
    console.log("figureStyle: ", fig.style.width);
    if ((typeof fig.firstChild['currentSrc'] != 'undefined') && fig.firstChild['currentSrc'] != "") {
      let blobData = dataURItoBlob(fig.firstChild['currentSrc']);

      let container: Filecontainer = {
        style: {
          width: fig.style.width,
          height: fig.style.height
        }
      }
      let fileHash = uuid();
      if (updateFiles) {
        let type = fig.firstChild['currentSrc'].split(',')[0].split(':')[1].split(';')[0];
        let file = new File([blobData], 'subFigure', { type: type })
        container.file = file;
        container.fileHash = fileHash;
        container.fileExtension = type;
        fig.firstChild['title'] = fileHash;
      } else {
        if (fileStorage.length > fileIndex) {
          container.fileHash = fileStorage[fileIndex].fileHash;
          container.fileExtension = fileStorage[fileIndex].fileExtension;
          fig.firstChild['title'] = fileStorage[fileIndex].fileHash;
        }
      }
      snippetFiles.push(container);

      fig.removeAttribute('style');
      fig.firstChild['src'] = '';
      console.log(fig);
    }
    fileIndex++;
  });

  let links = span.querySelectorAll("a");
  links.forEach(link => {
    console.log(link);
    let f = fileStorage.find(file => { return (file.fileHash == link.pathname.substring(1)) });
    if (typeof f != 'undefined') {
      snippetFiles.push(f);
    }
    if (typeof link.target != 'undefined') {
      link.target = "_blank";
    }
  })

  console.log(snippetFiles);

  console.log(span.innerHTML)

  let notification: ChangeStreamNotification = null
  if (dataEditor != '') {
    notification = {
      linkType: LinkType.PARAGRAPH,
      textcontent: span.innerHTML,
      files: snippetFiles
    }
  }

  return notification;

}

function dataURItoBlob(dataURI: string) {

  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}
