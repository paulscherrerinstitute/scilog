import { TestBed } from '@angular/core/testing';

import { SnackbarService } from './snackbar.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SnackbarService', () => {
  let service: SnackbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, BrowserAnimationsModule],
    });
    service = TestBed.inject(SnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  // it('should toggle snackbar', (done) =>{
    
  //   setTimeout(()=>{
  //     // expect(service['serverMessageShown']).toBeTruthy();
  //     // service.hideServerMessage();
  //     service['serverMessage'].dismiss();
  //     // expect(service['serverMessageShown']).toBeFalsy();
  //     done();
  //   }, 500);
  //   service.showServerMessage();
    
  // })
});
