import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnippetDashboardNameComponent } from './snippet-dashboard-name.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { Paragraphs } from '@model/paragraphs';


class DialogRefMock {
  close(){};
}


// const mockDialogRef = {
//   close: jasmine.createSpy('close')
// };

describe('SnippetDashboardNameComponent', () => {
  let component: SnippetDashboardNameComponent;
  let fixture: ComponentFixture<SnippetDashboardNameComponent>;
  let logbookItemDataSpy: any;
  logbookItemDataSpy = jasmine.createSpyObj("LogbookItemDataService", ["uploadParagraph"]);
  logbookItemDataSpy.uploadParagraph.and.returnValue(of({}).toPromise());


  let snippetMock: Paragraphs = {
    "id": "6058c1dbd9574d6f51e4b650",
    "ownerGroup": "p17642",
    "accessGroups": [
      "slscsaxs"
    ],
    "snippetType": "paragraph",
    "isPrivate": false,
    "defaultOrder": 1616429531087000,
    "createdAt": "2021-03-22T16:12:11.087Z",
    "createdBy": "wakonig_k@psi.ch",
    "updatedAt": "2021-03-22T16:12:11.087Z",
    "updatedBy": "wakonig_k@psi.ch",
    "parentId": "602d438ddaa91a637da2181a",
    "tags": [],
    "versionable": true,
    "deleted": false,
    "textcontent": "<p>test</p>"

  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: snippetMock },
        { provide: MatDialogRef, useClass: DialogRefMock },
        { provide: LogbookItemDataService, useValue: logbookItemDataSpy }
      ],
      declarations: [SnippetDashboardNameComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnippetDashboardNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    logbookItemDataSpy.uploadParagraph.calls.reset();
    // mockDialogRef.close.calls.reset();
  });

  // afterEach(() => {
  //   logbookItemDataSpy.uploadParagraph.calls.reset();
  //   mockDialogRef.close.calls.reset();
  // })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call save', () => {
    spyOn(component, 'saveClick')
    expect(component.saveClick).toHaveBeenCalledTimes(0);
  })

  it('should upload the new paragraph', () => {
    component.saveClick();
    expect(component['dataService'].uploadParagraph).toHaveBeenCalledTimes(1);
  })

  it('should close the dialog', async () => {
    let dialogRefSpy = spyOn(component['dialogRef'], 'close');

    await component.saveClick();
    expect(component['dialogRef'].close).toHaveBeenCalledTimes(1);
    dialogRefSpy.calls.reset();
    component.cancelClick();
    expect(component['dialogRef'].close).toHaveBeenCalledTimes(1);

  })

  // it('should close the dialog after cancel', ()=>{
  //   mockDialogRef.close.calls.reset();
  //   component.cancelClick();
  //   expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
  // })

});
