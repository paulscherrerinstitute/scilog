import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { ChangeStreamNotification } from '../../changestreamnotification.model';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { AppConfigService } from 'src/app/app-config.service';

declare const Zone: any;



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


  figures: HTMLElement[];
  figuresRef: HTMLElement[];
  filesRef: NodeListOf<HTMLElement>;
  _content: string;
  dataLoaded = false;
  filesLoaded: boolean[] = [];
  span: any;
  spanRef: any;
  files: string[] = [];
  defaultFigureWidth = '85%';
  contentWidth = null;

  @ViewChild('contentDiv') contentRef: ElementRef;

  constructor(
    private logbookItemDataService: LogbookItemDataService,     
    private appConfigService: AppConfigService,
    ) {
    console.log(this)
  }

  ngOnInit(): void {
    // console.log("CONTENT INIT")
    // console.log(this.snippet)
    if (this.snippet) {
      const p = this.prepareContent();
      // this.waitFor(p);
    }
  }

  async waitFor<T>(prom: Promise<T>): Promise<T> {
    const macroTask = Zone.current
      .scheduleMacroTask(
        `WAITFOR-${Math.random()}`,
        () => { },
        {},
        () => { }
      );
    return prom.then((p: T) => {
      macroTask.invoke();
      return p;
    });
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    console.log(this.contentRef.nativeElement.offsetWidth);
    this.contentWidth = this.contentRef.nativeElement.parentElement.offsetWidth;
  }

  prepareContent() {
    if (!this.snippet.files || (this.snippet.files.length == 0)) {
      this.content = this.snippet?.textcontent;
      this.isLoading.emit(false);
      return;
    }

    this.isLoading.emit(true);

    this.span = document.createElement('figure');
    this.span.innerHTML = this.snippet?.textcontent;
    const images = this.span.querySelectorAll("img")
    this.figures = this._figuresFromImages(images);

    this.spanRef = document.createElement('figure');
    this.spanRef.innerHTML = this._content;
    const imagesRef = this.spanRef.querySelectorAll("img")
    this.figuresRef = this._figuresFromImages(imagesRef);

    let fileCounter = 0;
    this.filesLoaded = [];
    for (let figCounter = 0; figCounter < this.figures.length; figCounter++) {
      let fig = this.figures[figCounter];
      console.log(this.snippet)
      // console.log(figCounter)
      // console.log(this.figures)

      if (fig.firstChild['title'] == this.snippet.files[fileCounter].fileHash) {
        let fileIndex = fileCounter++;
        this.filesLoaded.push(false);
        if ((this.files.length > 0) && (fileIndex <= this.files.length) && (this.files[fileIndex] == this.snippet.files[fileIndex].fileId)) {
          console.log('file is already known; no need to reload it');
          fig.firstChild['src'] = this.figuresRef[fileCounter - 1].firstChild['src'];
          if (this.snippet.files[fileIndex].style) {
            let style = this.snippet.files[fileIndex].style;
            if (style.width != "") {
              fig.firstElementChild.setAttribute('width', this.snippet.files[fileIndex].style.width)
            } else {
              fig.firstElementChild.setAttribute('width', this.defaultFigureWidth)
            }
            if (style.height != "") {
              fig.firstElementChild.setAttribute('height', this.snippet.files[fileIndex].style.height)
            }
          }
          this.setFileLoaded(fileIndex);
        } else {
          // console.log("loading image")
          if ((this.files.length > 0) && (fileIndex <= this.files.length)) {
            this.files[fileIndex] = this.snippet.files[fileIndex].fileId;
          } else {
            this.files.push(this.snippet.files[fileIndex].fileId);
          }
          let style = this.snippet.files[fileIndex].style;
          let calc_width = null;
          let calc_height = null;
          if ((this.contentWidth != null) && (style.ratio != "")) {
            calc_height = (this.contentRef.nativeElement.parentElement.offsetWidth - 80) * parseFloat(this.snippet.files[fileIndex].style.width) / 100 / parseFloat(style.ratio);
            calc_width = (this.contentRef.nativeElement.parentElement.offsetWidth - 80) * parseFloat(this.snippet.files[fileIndex].style.width) / 100;
          }
          if (calc_width != null) {
            fig.firstElementChild.setAttribute('width', calc_width + "px")
          } else {
            fig.firstElementChild.setAttribute('width', this.defaultFigureWidth)
          }
          if (calc_height != null) {
            fig.firstElementChild.setAttribute('height', calc_height + "px")
          }
          let imageId = this.snippet.files[fileIndex].accessHash ?? this.snippet.files[fileIndex].fileId
          const srcUrl = (this.appConfigService.getConfig().lbBaseURL ?? "http://localhost:3000/") + "images/" + imageId;
          fig['href'] = srcUrl;
          fig.firstChild['src'] = srcUrl;
          this.setFileLoaded(fileIndex);
        }
      }
    }

    this.filesRef = this.span.querySelectorAll("a");
    this.filesRef.forEach(fileRef => {
      this.filesLoaded.push(true);
      let file = this.snippet.files.find(file => { return (file['fileHash'] == fileRef['pathname'].substring(1)) });
      if (typeof file != 'undefined') {
        fileRef['href'] = fileRef['baseURI'] + 'download/' + file.fileId;
      }

      console.log(fileRef);
      this.setFileLoaded(this.fileLoaded.length - 1);
    })
  }

  private _figuresFromImages(images: any) {
    const figures = [];
    for (const image of images) {
      if (!image.parentElement.firstChild.href) {
        const hrefElement = document.createElement('a');
        image.parentElement.appendChild(hrefElement)
        hrefElement.appendChild(image)
      }
      if (image.parentElement.firstChild != image)
        image.parentElement.insertBefore(image, image.parentElement.firstChild);
      figures.push(image.parentElement);
    }
    return figures;
  }

  set content(value: string) {
    this._content = value;
    this.htmlContent.emit(this._content);
  }

  get content() {
    return this._content;
  }

  setFileLoaded(fileCounter: number) {
    // console.log("setting content")
    this.filesLoaded[fileCounter] = true;
    if (this.filesLoaded.every(this.fileLoaded)) {
      this.content = this.span.innerHTML;
      this.isLoading.emit(false);
    }
    // console.log(this.content);
    // console.log(this.filesLoaded);

  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();

    if (image) {
      reader.readAsDataURL(image);
    }
    return reader;
  }

  fileLoaded(file) {
    return file === true;
  }

}

