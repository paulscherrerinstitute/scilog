import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDialogComponent } from './export-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogbookItemDataService } from '@shared/remote-data.service';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';

const mockDialogRef = {
  close: jasmine.createSpy('close')
};

class NativeElementMock {
  href:string = "";
  download:string = "";
  click(){}

}

describe('ExportDialogComponent', () => {
  let component: ExportDialogComponent;
  let fixture: ComponentFixture<ExportDialogComponent>;
  let logbookItemDataSpy:any;
  logbookItemDataSpy = jasmine.createSpyObj("LogbookItemDataService", ["exportLogbook"]);
  logbookItemDataSpy.exportLogbook.and.returnValue(of(new Blob(['data:image/png;base64,iVBORw0KGgoAAAANSUhE'], {type: 'image/png'})).toPromise());

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LogbookItemDataService, useValue: logbookItemDataSpy}
      ],
      declarations: [ ExportDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(()=>{
    logbookItemDataSpy.exportLogbook.calls.reset();
    mockDialogRef.close.calls.reset();
  })

  it('should create', () => {
    spyOn(component, 'exportData')
    expect(component).toBeTruthy();
    expect(component.exportData).toHaveBeenCalledTimes(0);
  });

  it('should close the dialog', ()=>{
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
  })
  
  it('should close the dialog after export', async ()=>{
    component['downloadLink'].nativeElement = new NativeElementMock;
    spyOn(component['downloadLink'].nativeElement, 'click')

    await component.exportData("pdf");
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    expect(component['downloadLink'].nativeElement.click).toHaveBeenCalledTimes(1);
  })


});
