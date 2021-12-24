import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { Logbooks } from '@model/logbooks';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { LogbookItemDataService } from '@shared/remote-data.service';

@Component({
  selector: 'app-logbook-cover',
  templateUrl: './logbook-cover.component.html',
  styleUrls: ['./logbook-cover.component.css']
})
export class LogbookWidgetComponent implements OnInit {

  @Output() logbookSelection = new EventEmitter<string>();
  @Output() logbookEdit = new EventEmitter<Logbooks>();
  @Output() logbookDelete = new EventEmitter<string>();

  @Input()
  logbook: Logbooks;

  @ViewChild('cardHeader') cardHeader: ElementRef;

  imageToShow: any;
  isImageLoading: boolean;
  enableEdit = false;

  constructor(
    private logbookItemDataService: LogbookItemDataService,
    private userPreferences: UserPreferencesService,
    private logbookInfo: LogbookInfoService) { }

  ngOnInit(): void {
    if (this.logbook?.thumbnail) {
      this.getImageFromService();
    }
    if (this.userPreferences.userInfo?.roles.find(entry => {
      return entry == this.logbook.ownerGroup
    })) {
      this.enableEdit = true;
    }

  }

  ngAfterViewInit() {
    this.adjustHeaderFontSize(this.cardHeader);
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
    let data = await this.logbookItemDataService.getFile(this.logbook.thumbnail);
    this.createImageFromBlob(data);
    this.isImageLoading = false;
  }

  selection($event) {
    this.logbookSelection.emit(this.logbook.id);
    this.logbookInfo.logbookInfo = this.logbook;
    console.log("updating logbook in service:", this.logbookInfo.logbookInfo)
  }

  editLogbook() {
    this.logbookEdit.emit(this.logbook);
  }

  deleteLogbook() {
    this.logbookDelete.emit(this.logbook.id);
  }

  isOverflown(element: ElementRef) {
    return element.nativeElement.scrollHeight > element.nativeElement.clientHeight || element.nativeElement.scrollWidth > element.nativeElement.clientWidth;
  }

  adjustHeaderFontSize(element: ElementRef) {
    let fontSize = parseInt(element.nativeElement.style.fontSize);
    for (let i = fontSize; i >= 0; i--) {
      let overflow = this.isOverflown(element);
      if (overflow) {
        fontSize--;
        element.nativeElement.style.fontSize = fontSize + "px";
      }
    }
  }

  ngOnDestroy(): void {

  }

}
