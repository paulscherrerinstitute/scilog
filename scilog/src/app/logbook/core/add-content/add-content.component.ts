import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as ClassicEditor from '../ckeditor/ckeditor5/build/ckeditor';
import { ChangeEvent } from '../ckeditor/ckeditor5/build/ckeditor';
import { AddContentService } from "../add-content.service";
import { ChangeStreamNotification } from "../changestreamnotification.model";
import { LinkType } from '@model/paragraphs';
import { Subscription } from 'rxjs';
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
  editor: any;

  constructor(
    private dataService: AddContentService,
    @Inject(MAT_DIALOG_DATA) data: editorDataInput,
    private logbookInfo: LogbookInfoService,
    private httpClient: HttpClient) {
    this.editorConfig["autosave"] = {
      save: (editor) => {
        return this.editorChange(editor);
      },
      waitingTime: 5000
    };
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
      this.notification.snippetType = 'edit';
      this.notification.toDelete = false;
      this.liveFeedback = false;
      this.addButtonLabel = "Done";
      this.dialogTitle = "Modify data snippet";
      return this.sendMessage();
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

  onEditorReady(editor: any) {
    console.log(Array.from(editor.ui.componentFactory.names()));
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new CK5ImageUploadAdapter(loader, this.httpClient);
    };
    editor.editing.view.focus();
    this.editor = editor;
  };

  addContent($event: any) {
    console.log("adding new content");
    if (this.liveFeedback) {
      return;
    }

    if (this.editor != undefined) {
      this.data = this.editor.getData();
    }
    if (this.notification.snippetType === 'edit' && this.contentChanged)
      this.notification.snippetType = 'paragraph';
    this.prepareMessage(this.data);
    this.sendMessage();
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
    if (data)
      this.data = data;
    if (this.notification.snippetType === 'edit')
        this.sendMessage();
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
    let notification = extractNotificationMessage(data, this.message?.files ? this.message.files : []);
    if (notification != null) {
      this.notification.textcontent = notification.textcontent;
      this.notification.files = notification.files;
      this.notification.tags = this.tag;
    } else {
      this.notification.textcontent = "";
    }

    if (this.notification.linkType == LinkType.QUOTE) {
      console.log("preparing quote");
      // send paragraph and subsnippet (that is a copy of the reference);
      this.notification.linkType = LinkType.PARAGRAPH;
    }
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
      const imgCollection = fig.getElementsByTagName('img');
      if (imgCollection.length != 1) {
        return;
      }
      const img = imgCollection[0];
      if (!img.hasAttribute('width')) {
        return;
      }
      fig.setAttribute("style", "width:" + img.getAttribute('width') + ";");
    });
    this.data = span.innerHTML;

  }

  updateTags(tags: string[]) {
    this.tag = tags;
    this.contentChanged = true;
    this.changeChain();
  }

  toggleMetadataPanel() {
    this.metadataPanelExpanded = !this.metadataPanelExpanded;
  }

  ngOnDestroy(): void {
    this.sendEditDelitionMessage();
    console.log("deleting add-content subscriptions")
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
  }

  sendEditDelitionMessage() {
    if (this.dialogTitle === 'Modify data snippet') {
      this.notification.snippetType = 'edit';
      this.notification.toDelete = true;
      this.sendMessage();
    }
  }

  @HostListener('window:unload')
  onUnload() {
    this.sendEditDelitionMessage();
  }

}

export function extractNotificationMessage(htmlData: string, fileStorage: any = []) {

  console.log("extracting notification");

  let dataEditor = htmlData;
  var span = document.createElement('figure');
  span.innerHTML = dataEditor;

  let imgCollection = span.getElementsByTagName('img');

  let snippetFiles: Filecontainer[] = [];

  for (let index = 0; index < imgCollection.length; index++) {
    let img = imgCollection[index];
    console.log(img);
    let container: Filecontainer;
    if (img.src.startsWith("data:")) {
      // new image
      let blobData = dataURItoBlob(img.src);
      let type = img.src.split(',')[0].split(':')[1].split(';')[0];
      let file = new File([blobData], 'subFigure', { type: type });
      container = {
        style: {
          width: img.parentElement.style.width,
          height: img.parentElement.style.height
        },
        file: file,
        fileHash: uuid(),
        fileExtension: type
      }
      img.src = "";
    } else if (img.src.startsWith("http")) {
      // check for existing file
      container = fileStorage.find(fileEntry => img.src.includes(fileEntry.accessHash));
      container.style = {
        width: img.parentElement.style.width,
        height: img.parentElement.style.height
      };
    }

    if (container != undefined) {
      snippetFiles.push(container);
      img.parentElement.removeAttribute('style')
      img.title = container.fileHash;
    }

  };

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
