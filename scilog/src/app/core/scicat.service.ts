import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { ServerSettingsService } from './config/server-settings.service';
import {
  DatasetsService,
  OutputDatasetObsoleteDto,
  ProposalsService,
  ReturnedUserDto,
  UsersService,
} from '@scicatproject/scicat-sdk-ts-angular';
import { HttpContext, HttpContextToken } from '@angular/common/http';

export type Dataset = OutputDatasetObsoleteDto;
export type DatasetSummary = Pick<Dataset, 'pid' | 'datasetName' | 'creationTime'>;
export type ScicatUser = ReturnedUserDto;

export const IF_UNMODIFIED_SINCE = new HttpContextToken<string>(() => undefined);

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

  getDatasetsSummary(): Observable<DatasetSummary[]> {
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

  getUserLinkedDatasetsSummary(logbookId: string): Observable<DatasetSummary[]> {
    const filter = JSON.stringify({
      where: { 'relationships.relationship': 'Logbook', 'relationships.externalId': logbookId },
      fields: ['pid', 'datasetName', 'creationTime'],
    });
    return this.datasetsService.datasetsControllerFindAllV3(filter);
  }

  linkLogbookToDataset(logbookId: string, pid: string): Observable<boolean> {
    return this.getDataset(pid).pipe(
      switchMap((dataset) => {
        const alreadyLinked = dataset.relationships?.some(
          (rel) => rel.relationship === 'Logbook' && rel.externalId === logbookId,
        );
        if (alreadyLinked) {
          return of(false);
        }

        // the actual relationship object also contains an _id, it must be removed from the update request
        const existingRelationships = (dataset.relationships ?? []).map(
          ({ relationship, identifier, identifierType, entityType, externalId }) => ({
            relationship,
            identifier,
            identifierType,
            entityType,
            externalId,
          }),
        );
        const relationshipsUpdate = [
          ...existingRelationships,
          {
            relationship: 'Logbook',
            identifier: `${this.serverSettingsService.getScilogFrontendBaseUrl()}/logbooks/${logbookId}/dashboard`,
            identifierType: 'URL',
            entityType: 'Logbook',
            externalId: logbookId,
          },
        ];

        return this.datasetsService
          .datasetsControllerFindByIdAndUpdateV3(
            pid,
            { relationships: relationshipsUpdate },
            undefined,
            undefined,
            {
              context: new HttpContext().set(IF_UNMODIFIED_SINCE, dataset.updatedAt),
            },
          )
          .pipe(map(() => true));
      }),
    );
  }
}
