import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { LogbookItemDataService } from '@shared/remote-data.service';
import {CollectionConfig} from '@model/config';

@Component({
    selector: 'app-collection-widget',
    templateUrl: './collection-widget.component.html',
    styleUrls: ['./collection-widget.component.css'],
    standalone: false
})
export class CollectionWidgetComponent implements OnInit {

  @Output() collectionSelection = new EventEmitter<CollectionConfig>();

  @Input() 
  collection: CollectionConfig;


  imageToShow: string | ArrayBuffer;
  isImageLoading: boolean;

  constructor(private logbookItemDataService: LogbookItemDataService) {}

  ngOnInit(): void {
    if (this.collection?.thumbnail){
      this.getImageFromService();
    }
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
       this.imageToShow = reader.result;
    }, false);
 
    if (image) {
       reader.readAsDataURL(image);
    }
   }
 
   async getImageFromService() {
     this.isImageLoading = true;
     console.log(this.collection.thumbnail);
     let data = await this.logbookItemDataService.getFile(this.collection.thumbnail);
     this.createImageFromBlob(data);
     this.isImageLoading = false;
   }

  selection($event) {
    this.collectionSelection.emit(this.collection);
    console.log($event);
  }

  ngOnDestroy(): void {
  }

}
