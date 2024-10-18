import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { ChangeStreamNotification } from '../../changestreamnotification.model';
import { AppConfigService } from 'src/app/app-config.service';
import { Filecontainer } from 'src/app/core/model/basesnippets';
import { PrismService } from '../../prism.service';

@Component({
  selector: 'snippet-content',
  templateUrl: './snippet-content.component.html',
  styleUrls: ['./snippet-content.component.css'],
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
//       var s = document.createElement("iframe");
//       s.srcdoc = `<style>

// </style>

// <div id="fig_el1634831227398107381289418537862"></div>
// <script>
// function mpld3_load_lib(url, callback){
//   var s = document.createElement('script');
//   s.src = url;
//   s.async = true;
//   s.onreadystatechange = s.onload = callback;
//   s.onerror = function(){console.warn("failed to load library " + url);};
//   document.getElementsByTagName("head")[0].appendChild(s);
// }

// if(typeof(mpld3) !== "undefined" && mpld3._mpld3IsLoaded){
//    // already loaded: just create the figure
//    !function(mpld3){
       
//        mpld3.draw_figure("fig_el1634831227398107381289418537862", {"width": 1280.0, "height": 960.0, "axes": [{"bbox": [0.125, 0.10999999999999999, 0.775, 0.77], "xlim": [-1.4500000000000002, 30.45], "ylim": [-1.2862959785955874, 2.0789092975981367], "xdomain": [-1.4500000000000002, 30.45], "ydomain": [-1.2862959785955874, 2.0789092975981367], "xscale": "linear", "yscale": "linear", "axes": [{"position": "bottom", "nticks": 9, "tickvalues": null, "tickformat_formatter": "", "tickformat": null, "scale": "linear", "fontsize": 10.0, "grid": {"gridOn": false}, "visible": true}, {"position": "left", "nticks": 9, "tickvalues": null, "tickformat_formatter": "", "tickformat": null, "scale": "linear", "fontsize": 10.0, "grid": {"gridOn": false}, "visible": true}], "axesbg": "#FFFFFF", "axesbgalpha": null, "zoomable": true, "id": "el163483122738385657664", "lines": [{"data": "data01", "xindex": 0, "yindex": 1, "coordinates": "data", "id": "el163483122738384859584", "color": "#1F77B4", "linewidth": 1.5, "dasharray": "none", "alpha": 1, "zorder": 2, "drawstyle": "default"}], "paths": [], "markers": [], "texts": [], "collections": [], "images": [], "sharex": [], "sharey": []}], "data": {"data01": [[0.0, 1.9259454214075127], [1.0, 0.20331217570389423], [2.0, 1.010447596450215], [3.0, 1.355288873161437], [4.0, 1.8346626776069144], [5.0, -0.8427816625392469], [6.0, 0.5419463704937953], [7.0, -0.2827921214715988], [8.0, -1.1333321024049636], [9.0, 1.7695905417353388], [10.0, -0.2866117775771751], [11.0, 1.0276296796925377], [12.0, 0.3154977796657907], [13.0, 0.8444729534567649], [14.0, 0.04881739832598641], [15.0, 1.50362572934437], [16.0, 1.0899787656557893], [17.0, 0.5884797404694844], [18.0, 1.0628000352603975], [19.0, -0.787355376080956], [20.0, 1.260922246168629], [21.0, -0.029961742740657604], [22.0, 0.5058853526590547], [23.0, 1.6661827185328952], [24.0, -0.8015560501655563], [25.0, 0.2983812217254321], [26.0, -0.6649181642423507], [27.0, 1.0319095868292878], [28.0, 0.04858052155264239], [29.0, 1.7032059691352994]]}, "id": "el163483122739810738128", "plugins": [{"type": "reset"}, {"type": "zoom", "button": true, "enabled": false}, {"type": "boxzoom", "button": true, "enabled": false}]});
//    }(mpld3);
// }else if(typeof define === "function" && define.amd){
//    // require.js is available: use it to load d3/mpld3
//    require.config({paths: {d3: "https://d3js.org/d3.v5"}});
//    require(["d3"], function(d3){
//       window.d3 = d3;
//       mpld3_load_lib("https://mpld3.github.io/js/mpld3.v0.5.10.js", function(){
         
//          mpld3.draw_figure("fig_el1634831227398107381289418537862", {"width": 1280.0, "height": 960.0, "axes": [{"bbox": [0.125, 0.10999999999999999, 0.775, 0.77], "xlim": [-1.4500000000000002, 30.45], "ylim": [-1.2862959785955874, 2.0789092975981367], "xdomain": [-1.4500000000000002, 30.45], "ydomain": [-1.2862959785955874, 2.0789092975981367], "xscale": "linear", "yscale": "linear", "axes": [{"position": "bottom", "nticks": 9, "tickvalues": null, "tickformat_formatter": "", "tickformat": null, "scale": "linear", "fontsize": 10.0, "grid": {"gridOn": false}, "visible": true}, {"position": "left", "nticks": 9, "tickvalues": null, "tickformat_formatter": "", "tickformat": null, "scale": "linear", "fontsize": 10.0, "grid": {"gridOn": false}, "visible": true}], "axesbg": "#FFFFFF", "axesbgalpha": null, "zoomable": true, "id": "el163483122738385657664", "lines": [{"data": "data01", "xindex": 0, "yindex": 1, "coordinates": "data", "id": "el163483122738384859584", "color": "#1F77B4", "linewidth": 1.5, "dasharray": "none", "alpha": 1, "zorder": 2, "drawstyle": "default"}], "paths": [], "markers": [], "texts": [], "collections": [], "images": [], "sharex": [], "sharey": []}], "data": {"data01": [[0.0, 1.9259454214075127], [1.0, 0.20331217570389423], [2.0, 1.010447596450215], [3.0, 1.355288873161437], [4.0, 1.8346626776069144], [5.0, -0.8427816625392469], [6.0, 0.5419463704937953], [7.0, -0.2827921214715988], [8.0, -1.1333321024049636], [9.0, 1.7695905417353388], [10.0, -0.2866117775771751], [11.0, 1.0276296796925377], [12.0, 0.3154977796657907], [13.0, 0.8444729534567649], [14.0, 0.04881739832598641], [15.0, 1.50362572934437], [16.0, 1.0899787656557893], [17.0, 0.5884797404694844], [18.0, 1.0628000352603975], [19.0, -0.787355376080956], [20.0, 1.260922246168629], [21.0, -0.029961742740657604], [22.0, 0.5058853526590547], [23.0, 1.6661827185328952], [24.0, -0.8015560501655563], [25.0, 0.2983812217254321], [26.0, -0.6649181642423507], [27.0, 1.0319095868292878], [28.0, 0.04858052155264239], [29.0, 1.7032059691352994]]}, "id": "el163483122739810738128", "plugins": [{"type": "reset"}, {"type": "zoom", "button": true, "enabled": false}, {"type": "boxzoom", "button": true, "enabled": false}]});
//       });
//     });
// }else{
//     // require.js not available: dynamically load d3 & mpld3
//     mpld3_load_lib("https://d3js.org/d3.v5.js", function(){
//          mpld3_load_lib("https://mpld3.github.io/js/mpld3.v0.5.10.js", function(){
                 
//                  mpld3.draw_figure("fig_el1634831227398107381289418537862", {"width": 1280.0, "height": 960.0, "axes": [{"bbox": [0.125, 0.10999999999999999, 0.775, 0.77], "xlim": [-1.4500000000000002, 30.45], "ylim": [-1.2862959785955874, 2.0789092975981367], "xdomain": [-1.4500000000000002, 30.45], "ydomain": [-1.2862959785955874, 2.0789092975981367], "xscale": "linear", "yscale": "linear", "axes": [{"position": "bottom", "nticks": 9, "tickvalues": null, "tickformat_formatter": "", "tickformat": null, "scale": "linear", "fontsize": 10.0, "grid": {"gridOn": false}, "visible": true}, {"position": "left", "nticks": 9, "tickvalues": null, "tickformat_formatter": "", "tickformat": null, "scale": "linear", "fontsize": 10.0, "grid": {"gridOn": false}, "visible": true}], "axesbg": "#FFFFFF", "axesbgalpha": null, "zoomable": true, "id": "el163483122738385657664", "lines": [{"data": "data01", "xindex": 0, "yindex": 1, "coordinates": "data", "id": "el163483122738384859584", "color": "#1F77B4", "linewidth": 1.5, "dasharray": "none", "alpha": 1, "zorder": 2, "drawstyle": "default"}], "paths": [], "markers": [], "texts": [], "collections": [], "images": [], "sharex": [], "sharey": []}], "data": {"data01": [[0.0, 1.9259454214075127], [1.0, 0.20331217570389423], [2.0, 1.010447596450215], [3.0, 1.355288873161437], [4.0, 1.8346626776069144], [5.0, -0.8427816625392469], [6.0, 0.5419463704937953], [7.0, -0.2827921214715988], [8.0, -1.1333321024049636], [9.0, 1.7695905417353388], [10.0, -0.2866117775771751], [11.0, 1.0276296796925377], [12.0, 0.3154977796657907], [13.0, 0.8444729534567649], [14.0, 0.04881739832598641], [15.0, 1.50362572934437], [16.0, 1.0899787656557893], [17.0, 0.5884797404694844], [18.0, 1.0628000352603975], [19.0, -0.787355376080956], [20.0, 1.260922246168629], [21.0, -0.029961742740657604], [22.0, 0.5058853526590547], [23.0, 1.6661827185328952], [24.0, -0.8015560501655563], [25.0, 0.2983812217254321], [26.0, -0.6649181642423507], [27.0, 1.0319095868292878], [28.0, 0.04858052155264239], [29.0, 1.7032059691352994]]}, "id": "el163483122739810738128", "plugins": [{"type": "reset"}, {"type": "zoom", "button": true, "enabled": false}, {"type": "boxzoom", "button": true, "enabled": false}]});
//             })
//          });
// }
// </script>                                                                                                                                              
// `;
//       this.content = s.outerHTML;
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

