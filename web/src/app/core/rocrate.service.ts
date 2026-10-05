import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ServerSettingsService } from './config/server-settings.service';

// The scicat-rocrate service's response is of the form
//  { "data/": "20.500.11935/PID" }.
const DATA_DIR_KEY = 'data/';

@Injectable({
  providedIn: 'root',
})
export class RocrateService {
  constructor(
    private httpClient: HttpClient,
    private serverSettings: ServerSettingsService,
  ) {}

  // POST a logbook RO-Crate zip to the scicat-rocrate service, which creates a SciCat
  // dataset with the given ownerGroup. Return PID of the created dataset.
  importRoCrate(zip: Blob, ownerGroup: string): Observable<string> {
    const headers = new HttpHeaders({
      accept: 'application/json',
      'api-key': localStorage.getItem('scicat_token') ?? '',
      ownerGroup: ownerGroup,
      'Content-Type': 'application/zip',
    });
    return this.httpClient
      .post<Record<string, string>>(
        `${this.serverSettings.getScicatRocrateBaseUrl()}/api/v1/ro-crate/import`,
        zip,
        { headers },
      )
      .pipe(map((response) => response[DATA_DIR_KEY]));
  }
}
