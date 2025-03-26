import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerSettingsService } from './config/server-settings.service';
import type {
  OutputDatasetObsoleteDto,
  ReturnedUserDto,
} from '@scicatproject/scicat-sdk-ts-fetch';

export type Dataset = OutputDatasetObsoleteDto;
export type DatasetSummary = Pick<
  Dataset,
  'pid' | 'datasetName' | 'creationTime'
>;
export type ScicatUser = ReturnedUserDto;

@Injectable({
  providedIn: 'root',
})
export class DatasetService {
  constructor(
    private httpClient: HttpClient,
    private serverSettingsService: ServerSettingsService
  ) {}

  getDatasets(): Observable<DatasetSummary[]> {
    return this.httpClient.get<DatasetSummary[]>(
      `${this.serverSettingsService.getSciCatServerAddress()}/api/v3/datasets`,
      {
        params: {
          filter: JSON.stringify({
            fields: ['pid', 'datasetName', 'creationTime'],
          }),
        },
      }
    );
  }

  getDataset(pid: string): Observable<Dataset> {
    return this.httpClient.get<Dataset>(
      `${this.serverSettingsService.getSciCatServerAddress()}/api/v3/datasets/${encodeURIComponent(
        pid
      )}`
    );
  }

  getMyself(): Observable<ScicatUser> {
    return this.httpClient.get<ScicatUser>(
      `${this.serverSettingsService.getSciCatServerAddress()}/api/v3/users/my/self`
    );
  }
}
