import { TestBed } from '@angular/core/testing';

import { ChangeStreamService } from './change-stream.service';
import { SnackbarService } from '@shared/snackbar.service';
import { ServerSettingsService } from '@shared/config/server-settings.service';
import { AppConfigService } from 'src/app/app-config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Overlay } from '@angular/cdk/overlay';

const getConfig = () => ({});

describe('ChangeStreamService', () => {
  let service: ChangeStreamService;
  let snackSpy:any;
  let serverSpy:any;
  let changeSpy:any;

  snackSpy = jasmine.createSpyObj("SnackbarService", ["showServerMessage", "hideServerMessage"]);
  serverSpy = jasmine.createSpyObj("ServerSettingsService", ["getSocketAdress"]);
  changeSpy = jasmine.createSpyObj("ChangeStreamService", ["startWebsocket"]);

  beforeEach(async() => {
    TestBed.configureTestingModule({
      providers: [ChangeStreamService,
        {providers: SnackbarService, useValue:snackSpy},
        {providers: ServerSettingsService, useValue:serverSpy},
        {provide: AppConfigService, useValue: { getConfig }},
        MatSnackBar,
        Overlay
      ],
    });
    service = TestBed.inject(ChangeStreamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
