import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { ServerSettingsService } from './config/server-settings.service';
import {
  DatasetsService,
  OutputDatasetObsoleteDto,
  ProposalsService,
  ReturnedUserDto,
  UsersService,
} from '@scicatproject/scicat-sdk-ts-angular';

export type Dataset = OutputDatasetObsoleteDto;
export type DatasetSummary = Pick<Dataset, 'pid' | 'datasetName' | 'creationTime'>;
export type ScicatUser = ReturnedUserDto;

@Injectable({
  providedIn: 'root',
})
export class ScicatService {
  constructor(
    private serverSettingsService: ServerSettingsService,
    private datasetsService: DatasetsService,
    private usersService: UsersService,
    private proposalsService: ProposalsService,
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
      pid,
    )}`;
  }

  getProposalPageUrl(proposalId: string): string {
    return `${this.serverSettingsService.getScicatFrontendBaseUrl()}/proposals/${encodeURIComponent(
      proposalId,
    )}`;
  }

  private getProposalIdForOwnerGroup(ownerGroup: string): Observable<string[]> {
    const filter = JSON.stringify({
      where: { ownerGroup: ownerGroup },
      fields: ['proposalId'],
    });
    return this.proposalsService
      .proposalsControllerFindAllV3(filter)
      .pipe(map((proposals) => proposals.map((proposal) => proposal.proposalId)));
  }

  getProposalLinkedDatasets(ownerGroup: string): Observable<DatasetSummary[]> {
    return this.getProposalIdForOwnerGroup(ownerGroup).pipe(
      switchMap((proposalIds: string[]) => {
        const filter = JSON.stringify({
          where: { proposalId: { inq: proposalIds } },
          fields: ['pid', 'datasetName', 'creationTime'],
        });
        return this.datasetsService.datasetsControllerFindAllV3(filter);
      }),
    );
  }
}
