import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Logbooks } from '@model/logbooks';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { Router, RouterLink } from '@angular/router';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { ActionsMenuComponent } from '../actions-menu/actions-menu.component';
import { NgIf } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-logbook-cover',
    templateUrl: './logbook-cover.component.html',
    styleUrls: ['./logbook-cover.component.css'],
    imports: [MatCard, MatCardHeader, MatCardTitle, MatTooltip, MatCardSubtitle, ActionsMenuComponent, NgIf, RouterLink, MatCardContent, MatDivider, MatCardActions, MatButton]
})
export class LogbookWidgetComponent implements OnInit, AfterViewInit {

  @Output() logbookSelection = new EventEmitter<string>();
  @Output() logbookEdit = new EventEmitter<Logbooks>();
  @Output() logbookDelete = new EventEmitter<string>();

  @Input()
  logbook: Logbooks;

  @ViewChild('cardHeader') cardHeader: ElementRef;

  imageToShow: any;
  isImageLoading: boolean;
  isOverflowing = false;

  constructor(
    private logbookItemDataService: LogbookItemDataService,
    private logbookInfo: LogbookInfoService,
    private router: Router) { }

  ngOnInit(): void {
    if (this.logbook?.thumbnail) {
      this.getImageFromService();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isOverflowing = this.isOverflown(this.cardHeader);
    });

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
    let data = await this.logbookItemDataService.getImage(this.logbook.thumbnail);
    this.createImageFromBlob(data);
    this.isImageLoading = false;
  }

  selection() {
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
    return element.nativeElement.scrollWidth > element.nativeElement.clientWidth;
  }

  selectOnDoubleClick() {
    this.router.navigateByUrl(`/logbooks/${this.logbook.id}/dashboard`);
    this.selection();
  }

}
