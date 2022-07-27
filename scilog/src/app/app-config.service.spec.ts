import { HttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { AppConfig, AppConfigService } from "./app-config.service";

const appConfig: AppConfig = {
  lbBaseURL: 'https://someurl',
}
class MockHttp {
  public get(url: string) {
    return of({});
  }
}

describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppConfigService,
        { provide: HttpClient, useClass: MockHttp },
      ],
    });
    service = TestBed.inject(AppConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should load the config from the provided source', async () => {
    spyOn(service["http"], "get").and.returnValue(of(appConfig));
    await service.loadAppConfig();
    expect(service["appConfig"]).toEqual(appConfig);
  });

  it('should return the AppConfig object', async () => {
    spyOn(service["http"], "get").and.returnValue(of(appConfig));
    await service.loadAppConfig();
    const config = service.getConfig();
    expect(config).toEqual(appConfig);
  });

});
