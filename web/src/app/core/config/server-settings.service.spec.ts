import { TestBed } from '@angular/core/testing';
import { AppConfigService } from 'src/app/app-config.service';

import { ServerSettingsService } from './server-settings.service';

const getConfig = () => ({});

describe('ServerSettingsService', () => {
  let service: ServerSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AppConfigService, useValue: { getConfig } }],
    });
    service = TestBed.inject(ServerSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('getServerAddress should return string', () => {
    expect(typeof service.getServerAddress() == 'string').toBe(true);
  });
  it('getServerAddress should return string with trailing slash', () => {
    expect(service.getServerAddress().slice(-1)).toBe('/');
  });
  it('getSocketAddress should return string with leading ws', () => {
    expect(service.getSocketAddress().substring(0, 2)).toBe('ws');
  });
});
