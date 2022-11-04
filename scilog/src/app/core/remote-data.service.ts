import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Basesnippets, Filecontainer } from '@model/basesnippets';
import { Filesnippet } from '@model/filesnippet';
import { Logbooks } from '@model/logbooks';
import { LinkType } from '@model/paragraphs';
import { ChangeStreamNotification } from '@shared/changestreamnotification.model';
import { ServerSettingsService } from './config/server-settings.service';
import { User } from '@model/user';
import { Tasks } from '@model/tasks';
import { UserPreferences, WidgetConfig, WidgetItemConfig } from '@model/config';
import { UserInfo } from '@model/user-info';
import { Views } from '@model/views';
import { Images } from '@model/images';
import _ from 'lodash';
import { TagsStat } from '@model/tags';

interface Count {
  "count": number;
}

@Injectable({
  providedIn: 'root'
})
export class RemoteDataService {


  constructor(private httpClient: HttpClient,
    private serverSettings: ServerSettingsService) { }

  protected deleteSnippet(snippetPath: string, snippetId: string) {
    return this.httpClient.delete(this.serverSettings.getServerAddress() + snippetPath + "/" + snippetId);
  }

  protected patchSnippet<T>(snippetPath: string, snippetId: string, payload: any, headers: HttpHeaders) {
    return this.httpClient.patch<T>(this.serverSettings.getServerAddress() + snippetPath + "/" + snippetId, payload, { headers });
  }

  protected postSnippet<T>(snippetPath: string, payload: any, headers: HttpHeaders) {
    return this.httpClient.post<T>(this.serverSettings.getServerAddress() + snippetPath, payload, { headers });
  }

  protected uploadFile(formData: any, header: HttpHeaders = null) {
    if (header == null) {
      header = new HttpHeaders().append('accept', 'application/json');
    }
    return this.httpClient.post(this.serverSettings.getServerAddress() + "files", formData, { headers: header });
  }

  protected getSnippets<T>(snippetPath: string, options: Object) {
    return this.httpClient.get<T>(this.serverSettings.getServerAddress() + snippetPath, options);
  }

  protected async postImage(payloadImage: Images) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    let data = await this.postSnippet<Images>("images", JSON.stringify(payloadImage), headers).toPromise();
    return data;
  }

  protected async postFilesnippet(payload: Filesnippet, file: File) {
    let formData = new FormData();
    let headersFile = new HttpHeaders();
    headersFile = headersFile.append('accept', 'application/json');
    formData.append('file', file);
    formData.append('fields', JSON.stringify(payload));
    return this.postSnippet<Filesnippet>("filesnippet/files", formData, headersFile).toPromise();
  }

  // getFile(imageSnippetUrl: string): Promise<Blob> {
  //   return this.getSnippets<Blob>(imageSnippetUrl, { responseType: 'blob' }).toPromise();
  // }

}

@Injectable({
  providedIn: 'root'
})
export class LogbookItemDataService extends RemoteDataService {

  private _searchString = "";

  public get searchString(): string {
    return this._searchString;
  }
  public set searchString(value: string) {
    this._searchString = value;
  }


  static _prepareFilters(config: WidgetItemConfig, index: number = 0, count: number = Infinity): Object {
    let httpFilter: Object = {};
    if (typeof config.view.order != 'undefined') {
      httpFilter["order"] = config.view.order;
    } else {
      httpFilter["order"] = ["defaultOrder ASC"];
    }

    let whereFilter: Object[] = [];
    whereFilter.push({ "or": [{ "snippetType": "paragraph" }, { "snippetType": "image" }, { "snippetType": "filesnippet" }] });

    let parentIds: string[] = [];
    if ((config.filter?.targetId) && (config.filter.targetId.length > 1)) {
      parentIds.push(config.filter.targetId);
    }
    if (config.filter.additionalLogbooks.length > 0) {
      parentIds.push(...config.filter.additionalLogbooks);
    }
    if (parentIds.length > 0) {
      let parentFilter = [];
      for (let parent of parentIds) {
        parentFilter.push({ "parentId": { "eq": parent } });
      }
      whereFilter.push({ "or": parentFilter });
    }


    if ((config.filter.tags) && (config.filter.tags.length > 0)) {
      config.filter.tags.forEach(tag => {
        whereFilter.push({ "tags": tag })
      })

    }
    httpFilter["where"] = { "and": whereFilter };

    if (count < Infinity) {
      httpFilter["limit"] = count;
    }
    if (index > 0) {
      httpFilter["skip"] = index;
    }
    // console.log(httpFilter);
    // console.log(tagContainer);
    httpFilter["include"] = [{ "relation": "subsnippets" }];
    return httpFilter;
  }

  static _prepareParams(config: WidgetItemConfig, index: number = 0, count: number = Infinity): HttpParams {
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(LogbookItemDataService._prepareFilters(config, index, count)));
    return params;
  }

  getDataBuffer(index: number, count: number, config: WidgetItemConfig) {
    console.log(index, count)

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    this._searchString = this._searchString.trim();
    if (this._searchString.length == 0) {
      return this.getSnippets<any[]>('basesnippets', { headers: headers, params: LogbookItemDataService._prepareParams(config, index, count) }).toPromise();
    } else {
      return this.getSnippets<any[]>('basesnippets/search=' + this._searchString, { headers: headers, params: LogbookItemDataService._prepareParams(config, index, count) }).toPromise();
    }

  }

  getFile(imageSnippetUrl: string): Promise<Blob> {
    return this.getSnippets<Blob>(imageSnippetUrl, { responseType: 'blob' }).toPromise();
  }

  async getImage(id: string) {
    // first retrieve image snippet, then filesnippet and then file
    // let fileSnippet = await this.getFilesnippet(id);
    // console.log(fileSnippet)
    // let headers = new HttpHeaders();
    // headers = headers.set('Accept', 'application/json');
    return this.getSnippets<Blob>("filesnippet/" + id + "/files", { responseType: 'blob' }).toPromise();
  }

  getFilesnippet(id: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.getSnippets<Filesnippet>('filesnippet/' + id, { headers: headers }).toPromise();
  }

  deleteLogbookItem(snippetId: string): Promise<any> {
    // const headers = new HttpHeaders().set('Content-Type', 'application/json');
    // let payload: ChangeStreamNotification = {
    //   tags: ["_delete_" + snippetId]
    // };
    return this.deleteSnippet("basesnippets", snippetId).toPromise();
  }

  getBasesnippet(id: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    let httpFilter: Object = {};
    httpFilter["include"] = [{ "relation": "subsnippets" }];

    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(httpFilter));

    return this.getSnippets<Basesnippets>('basesnippets/' + id, { headers: headers, params: params }).toPromise();
  }

  async getCount(config: any) {
    let filter = LogbookItemDataService._prepareFilters(config);
    // let whereFilter = filter["where"];
    console.log(filter);
    let params = new HttpParams();
    params = params.set('where', JSON.stringify(filter["where"]));
    // let count:Count = await this.getSnippets<Count>('basesnippets/count', {params:params}).toPromise();
    return this.getSnippets<Count>('basesnippets/count', { params: params }).toPromise()
  }

  async getIndex(id: string, config: any) {
    let filter = LogbookItemDataService._prepareFilters(config);
    console.log(filter);
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(filter));
    return this.getSnippets<number>('basesnippets/index=' + id, { params: params }).toPromise()
  }

  private async _uploadImageFile(payload: ChangeStreamNotification): Promise<ChangeStreamNotification> {
    if (payload.files) {
      console.log(payload);
      await Promise.all(payload.files.map(async file => {
        if (file.file) {
          // first upload filesnippet then set file id for basesnippet
          // let imgPayload: Images = _.pick(payload, ['ownerGroup', 'accessGroups', 'isPrivate']);
          let filePayload: Filesnippet = _.pick(payload, ['ownerGroup', 'accessGroups', 'isPrivate']);
          filePayload.fileExtension = file.fileExtension.split("/")[1];
          let dataFile = await this.postFilesnippet(filePayload, file.file);
          console.log(filePayload)
          delete file.file;

          console.log(file);

          file.fileId = dataFile.id;
          file.accessHash = dataFile.accessHash // TODO: remove this static assignment and instead retrieve the accessHash dynamically
        }
      }))
    }
    console.log(payload);
    return payload;
  }

  async uploadParagraph(payload: ChangeStreamNotification, id?: string) {
    // let files: FilesSnippet[] = [];
    let subsnippet: ChangeStreamNotification = null;
    if ((payload?.subsnippets) && (payload.subsnippets.length > 0)) {
      subsnippet = JSON.parse(JSON.stringify(payload.subsnippets[0]));
    }
    delete payload.subsnippets;

    if (id) {
      // patch existing snippet
      console.log("PATCH", payload)
      payload = await this._uploadImageFile(payload);

      let headers = new HttpHeaders();
      headers = headers.set('Content-Type', 'application/json; charset=utf-8');
      await this.patchSnippet("basesnippets", id, JSON.stringify(payload), headers).toPromise();
    } else {
      payload = await this._uploadImageFile(payload);

      let headers = new HttpHeaders();
      headers = headers.set('Content-Type', 'application/json; charset=utf-8');
      console.log(payload);
      let data = await this.postSnippet<Basesnippets>("basesnippets", JSON.stringify(payload), headers).toPromise();
      if (subsnippet != null) {
        subsnippet.parentId = data.id;
        subsnippet.linkType = LinkType.QUOTE;
        await this.postSnippet<Basesnippets>("basesnippets", JSON.stringify(subsnippet), headers).toPromise();
      }
    }
  }

  exportLogbook(exportType: string, config: any, skip: number, limit: number): Promise<Blob> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return this.getSnippets<Blob>("basesnippets/export=" + exportType + "", { headers: headers, responseType: 'blob', params: LogbookItemDataService._prepareParams(config, skip, limit) }).toPromise();
  }
}

@Injectable({
  providedIn: 'root'
})
export class LogbookDataService extends RemoteDataService {

  private _searchString = "";

  public get searchString(): string {
    return this._searchString;
  }
  public set searchString(value: string) {
    this._searchString = value;
  }

  deleteLogbook(logbookId: string): Promise<any> {
    return this.deleteSnippet("logbooks", logbookId).toPromise();
  }

  patchLogbook(logbookId: string, payload: any): Promise<Logbooks> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.patchSnippet<Logbooks>('logbooks', logbookId, JSON.stringify(payload), headers).toPromise();
  }

  postLogbook(payload: any): Promise<Logbooks> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.postSnippet<Logbooks>('logbooks', JSON.stringify(payload), headers).toPromise();
  }

  uploadLogbookThumbnail(formData: any, header: HttpHeaders = null): Promise<any> {
    return this.uploadFile(formData, header).toPromise();
  }

  getLocations() {
    let params = new HttpParams();
    let httpFilter: Object = {};
    httpFilter["order"] = ["defaultOrder ASC"];
    httpFilter["where"] = { "or": [{ "snippetType": "paragraph" }, { "snippetType": "image" }], "title": "location", "ownerGroup": "admin" };
    httpFilter["include"] = [{ "relation": "subsnippets" }];
    // console.log(JSON.stringify(httpFilter));
    params = params.set('filter', JSON.stringify(httpFilter));
    // console.log(params);
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.getSnippets<Basesnippets[]>('basesnippets', { headers: headers, params: params }).toPromise();
  }

  _getLogbookInfo(id: string): Promise<Logbooks> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.getSnippets<Logbooks>('logbooks/' + id, { headers: headers }).toPromise();
  }

  _getAvailLogbooks(): Promise<Logbooks[]> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.getSnippets<Logbooks[]>('logbooks', { headers: headers }).toPromise();
  }

  getDataBuffer(index: number, count: number, config: WidgetItemConfig) {
    console.log(index, count)

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    this._searchString = this._searchString.trim();


    let httpFilter: Object = {};
    httpFilter["order"] = ["defaultOrder DESC"];

    let whereFilter: Object[] = [];
    whereFilter.push({ "snippetType": "logbook" });

    httpFilter["where"] = { "and": whereFilter };

    if (count < Infinity) {
      httpFilter["limit"] = count;
    }
    if (index > 0) {
      httpFilter["skip"] = index;
    }

    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(httpFilter))

    if (this._searchString.length == 0) {
      return this.getSnippets<any[]>('basesnippets', { headers: headers, params: params }).toPromise();
    } else {
      return this.getSnippets<any[]>('basesnippets/search=' + this._searchString, { headers: headers, params: params }).toPromise();
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class WidgetPreferencesDataService extends RemoteDataService {

  getSnippetsForLogbook(logbookId: string): Promise<Basesnippets[]> {
    let params = new HttpParams();
    let httpFilter: Object = {};
    httpFilter["where"] = { "parentId": logbookId };
    params = params.set('filter', JSON.stringify(httpFilter));
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.getSnippets<Basesnippets[]>('basesnippets', { headers: headers, params: params }).toPromise();
  }

  getPlotSnippets(logbookId: string): Promise<Basesnippets[]> {
    let params = new HttpParams();
    let httpFilter: Object = {};
    httpFilter["where"] = { "parentId": logbookId, "snippetType": "plot" };
    params = params.set('filter', JSON.stringify(httpFilter));
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.getSnippets<Basesnippets[]>('basesnippets', { headers: headers, params: params }).toPromise();
  }
}

@Injectable({
  providedIn: 'root'
})
export class SnippetViewerDataService extends RemoteDataService {
  getSnippetViewerData(snippetId: string): Promise<Basesnippets[]> {
    let params = new HttpParams();
    let httpFilter: Object = {};
    httpFilter["where"] = { "id": snippetId };
    params = params.set('filter', JSON.stringify(httpFilter));
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.getSnippets<Basesnippets[]>('basesnippets', { headers: headers, params: params }).toPromise();
  }
}

@Injectable({
  providedIn: 'root'
})
export class PlotDataService extends RemoteDataService {
  getPlotSnippets(snippetId: string): Promise<Basesnippets[]> {
    let params = new HttpParams();
    let httpFilter: Object = {};
    httpFilter["where"] = { "id": snippetId };
    params = params.set('filter', JSON.stringify(httpFilter));
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.getSnippets<Basesnippets[]>("basesnippets", { headers: headers, params: params }).toPromise();
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthDataService extends RemoteDataService {
  login(principal: string, password: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.postSnippet<User>('users/login', { principal, password }, headers)
  }
}


@Injectable({
  providedIn: 'root'
})
export class TaskDataService extends RemoteDataService {

  getTasksData(id: string): Promise<Tasks[]> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    let httpFilter: Object = {};
    httpFilter["where"] = { "parentId": id };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(httpFilter));
    return this.getSnippets<Tasks[]>("tasks", { headers: headers, params: params }).toPromise();
  }

  addTask(task: Tasks): Promise<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.postSnippet<any>('tasks', JSON.stringify(task), headers).toPromise();
  }

  patchTask(task: Object, id: string): Promise<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.patchSnippet<any>('tasks', id, JSON.stringify(task), headers).toPromise();
  }

  deleteTask(id: string): Promise<any> {
    return this.deleteSnippet('tasks', id).toPromise();
  }
}

@Injectable({
  providedIn: 'root'
})
export class TagDataService extends RemoteDataService {
  private isValidTag(tag: string) {
    if (tag.includes("_delete_")) {
      return false;
    }
    return true;
  }
  async getTags(id: string): Promise<TagsStat[]> {
    let httpFilter: Object = {};
    httpFilter["where"] = { "parentId": id };
    httpFilter["fields"] = { "tags": true };
    let params = new HttpParams();
    params = params.set('filter', JSON.stringify(httpFilter));
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    let data = await this.getSnippets<Basesnippets[]>("basesnippets/", { headers: headers, params: params }).toPromise();
    let tags = _.compact(data.map(x => {
      if ((x.tags) && (x.tags.length > 0)) {
        return x.tags.filter(tag => { return this.isValidTag(tag) });
      } else {
        return null;
      }
    }));

    let res: TagsStat[] = [];

    tags.forEach(snippet => {
      snippet.forEach(tag => {
        let entry = res.find(e => e.name == tag);
        typeof entry == 'undefined' ? res.push({ name: tag, count: 1 }) : entry.count += 1;
      })
    })
    return _.orderBy(res, ['count'], ['desc']);

  }
  getLastEntry(config: WidgetItemConfig) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    console.log(config);
    let _config = JSON.parse(JSON.stringify(config));
    if (typeof _config.view.order != 'undefined') {
      let order = _config.view.order[0].split(" ");
      _config.view.order = order[0] + " DESC";
    } else {
      _config.view.order = ["defaultOrder DESC"];
    }
    console.log(_config);
    return this.getSnippets<any[]>('basesnippets', { headers: headers, params: LogbookItemDataService._prepareParams(_config, 0, 1) }).toPromise();
  }
}


@Injectable({
  providedIn: 'root'
})
export class UserPreferencesDataService extends RemoteDataService {

  getUserPreferences() {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.getSnippets<UserPreferences[]>('user-preferences', { headers: headers });
  }

  getUserInfo() {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.getSnippets<UserInfo>('users/me', { headers: headers }).toPromise();
  }

  postUserPreferences(payload: Object): Promise<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.postSnippet<any>('user-preferences', JSON.stringify(payload), headers).toPromise();
  }

  deleteUserPreferences(id: string): Promise<any> {
    return this.deleteSnippet('user-preferences', id).toPromise();
  }

}

@Injectable({
  providedIn: 'root'
})
export class ViewDataService extends RemoteDataService {

  getViews(id: string): Promise<Views[]> {
    let params = new HttpParams();
    let httpFilter: Object = {};
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    httpFilter["where"] = { "parentId": id };
    params = params.set('filter', JSON.stringify(httpFilter));
    return this.getSnippets<Views[]>("views", { headers: headers, params: params }).toPromise();
  }

  postView(payload: any): Promise<Views> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return this.postSnippet<Views>("views", JSON.stringify(payload), headers).toPromise();
  }

  patchView(payload: any, id: string): Promise<Views> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return this.patchSnippet<Views>('views', id, JSON.stringify(payload), headers).toPromise();
  }

}


@Injectable({
  providedIn: 'root'
})
export class SearchDataService extends RemoteDataService {

  private _searchString = "";

  public get searchString(): string {
    return this._searchString;
  }
  public set searchString(value: string) {
    this._searchString = value;
  }

  getDataBuffer(index: number, count: number, config: WidgetItemConfig) {
    console.log(index, count)

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    this._searchString = this._searchString.trim();
    if (this._searchString.length == 0) {
      return this.getSnippets<any[]>('basesnippets', { headers: headers, params: LogbookItemDataService._prepareParams(config, index, count) }).toPromise();
    } else {
      return this.getSnippets<any[]>('basesnippets/search=' + this._searchString, { headers: headers, params: LogbookItemDataService._prepareParams(config, index, count) }).toPromise();
    }

  }

}