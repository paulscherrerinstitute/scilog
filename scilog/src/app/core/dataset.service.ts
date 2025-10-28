import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerSettingsService } from './config/server-settings.service';
import {
  DatasetsService,
  OutputDatasetObsoleteDto,
  ReturnedUserDto,
  UsersService,
} from '@scicatproject/scicat-sdk-ts-angular';

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
    private serverSettingsService: ServerSettingsService,
    private datasetsService: DatasetsService,
    private usersService: UsersService
  ) {}

  getDatasets(): Observable<DatasetSummary[]> {
    const filter = JSON.stringify({
      fields: ['pid', 'datasetName', 'creationTime'],
      limits: { limit: 100, order: 'creationTime:desc' },
    });
    return this.datasetsService.datasetsControllerFindAllV3(filter);
  }

  getDataset(pid: string): Observable<Dataset> {
    return this.datasetsService.datasetsControllerFindByIdV3(pid);
  }

  getMyself(): Observable<ScicatUser> {
    return this.usersService.usersControllerGetMyUserV3() as Observable<ScicatUser>;
  }

  getDatasetDetailPageUrl(pid: string): string {
    return `${this.serverSettingsService.getScicatFrontendBaseUrl()}/datasets/${encodeURIComponent(
      pid
    )}`;
  }
}
