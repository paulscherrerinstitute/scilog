import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { ChangeStreamNotification } from '../../changestreamnotification.model';
import { AppConfigService } from 'src/app/app-config.service';
import { Filecontainer } from 'src/app/core/model/basesnippets';
import { PrismService } from '../../prism.service';

@Component({
    selector: 'snippet-content',
    templateUrl: './snippet-content.component.html',
    styleUrls: ['./snippet-content.component.css']
})
export class SnippetContentComponent implements OnInit {

  @Input()
  snippet: ChangeStreamNotification;

  @Output() htmlContent = new EventEmitter<string>();

  @Output() isLoading = new EventEmitter<boolean>();


  _content: string;
  span: any;
  files: string[] = [];
  defaultFigureWidth = '85%';
  contentWidth = null;
  _prismed = false;
  _edited = "";

  @ViewChild('contentDiv') contentRef: ElementRef;

  constructor(
    private appConfigService: AppConfigService,
    private prismservice: PrismService
  ) {
    console.log(this)
  }

  ngOnInit(): void {
    if (this.snippet) {
      this.prepareContent();
    }
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    console.log(this.contentRef.nativeElement.offsetWidth);
    this.contentWidth = this.contentRef.nativeElement.parentElement.offsetWidth;
  }

  ngAfterViewChecked(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    if (!this._prismed) {
      this.prismservice.highlightAll();
      this._prismed = true;
    }
  }

  prepareContent() {
    if (!this.snippet.files || (this.snippet.files.length == 0)) {
      this.content = this.snippet?.textcontent;
      return;
    }

    this.span = document.createElement('figure');
    this.span.innerHTML = this.snippet?.textcontent;
    const images = this.span.querySelectorAll("img")
    this.addLinksToImages(images);

    images.forEach((img: HTMLImageElement) => {
      const file = this.snippet.files.find((file: Filecontainer) => file.fileHash == img.title);
      if (file == undefined) {
        return;
      }
      let imageId = file.accessHash ?? file.fileId
      this.setImageUrl(img, imageId);
      this.setImageStyle(img, file.style);
    });


    const fileLinks = this.span.querySelectorAll(".fileLink");
    fileLinks.forEach(fileRef => {
      let file = this.snippet.files.find(file => { return (file['fileHash'] == fileRef['pathname'].substring(1)) });
      if (typeof file != 'undefined') {
        fileRef['href'] = fileRef['baseURI'] + 'download/' + file.fileId;
      }
    });
    this.content = this.span.innerHTML;
  }

  private setEdited(content: string) {
    if (this.snippet?.updatedAt === this.snippet?.createdAt || !this.snippet?.id_session) 
      return content
    const emptyElement = document.createElement("span");
    const edited = document.createElement("span");
    edited.classList.add("snippet-edited");
    edited.innerHTML = "(edited)";
    emptyElement.appendChild(edited);
    if (content) {
      edited.insertAdjacentHTML('beforebegin', content);
      emptyElement.firstElementChild.classList.add("snippet-content-edited");
    }
    return emptyElement.innerHTML
  }

  private setImageUrl(img: HTMLImageElement, id: string) {
    const srcUrl = this._srcUrlFromImageId(id);
    img.src = srcUrl;
    (img.parentElement as HTMLAnchorElement).href = srcUrl;
  }

  private setImageStyle(img: HTMLImageElement, style: any) {
    if (style == undefined) {
      return;
    }
    const width = (style.width != "") ? style.width : this.defaultFigureWidth;
    img.setAttribute('width', width);

    if (style.height != "") {
      img.setAttribute('height', style.height);
    }
  }

  private _srcUrlFromImageId(imageId: string) {
    return `${this.appConfigService.getConfig().lbBaseURL ?? "http://localhost:3000/"}images/${imageId}`;
  }

  private addLinksToImages(images: any) {
    if (images.length === 0)
      return images;
    for (const image of images) {
      if (!image.parentElement.firstChild.href) {
        const hrefElement = document.createElement('a');
        hrefElement.setAttribute('target', '_blank');
        hrefElement.setAttribute('rel', 'noopener noreferrer');
        image.parentElement.appendChild(hrefElement)
        hrefElement.appendChild(image)
      } else {
        image.parentElement.firstChild.setAttribute('target', '_blank');
        image.parentElement.firstChild.setAttribute('rel', 'noopener noreferrer');
      }
      if (image.parentElement.firstChild != image)
        image.parentElement.insertBefore(image, image.parentElement.firstChild);
    }
  }

  set content(value: string) {
    this._content = value;
    this.htmlContent.emit(this._content);
    this._prismed = false;
  }

  get content() {
    return this.setEdited(this._content ?? '');
  }

}

