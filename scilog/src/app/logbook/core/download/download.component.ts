import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LogbookItemDataService } from '@shared/remote-data.service';

@Component({
    selector: 'app-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {

  @ViewChild('downloadLink') private downloadLink: ElementRef;


  constructor(
    public route: ActivatedRoute,
    private logbookItemDataService: LogbookItemDataService) { }

  ngOnInit(): void {
    // console.log(this.route)
    this.exportData();
  }

  async exportData() {
    // console.log(this.config)
    // this.inProgress = true;
    // console.log(exportType);
    console.log("exportData")
    let fileSnippet = await this.logbookItemDataService.getFilesnippet(this.route.snapshot.params.fileId);
    const blob = await this.logbookItemDataService.getImage(this.route.snapshot.params.fileId);
    console.log("blob:", blob);
    if ((typeof blob != undefined) && (blob != null)) {
      const url = window.URL.createObjectURL(blob);
      // console.log(fileSnippet);
      const link = this.downloadLink.nativeElement;
      link.href = url;
      link.download = fileSnippet.id + '.' + fileSnippet.fileExtension;
      link.click();

      window.URL.revokeObjectURL(url);
    }

  }

}
