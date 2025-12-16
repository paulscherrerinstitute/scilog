import { Injectable } from '@angular/core';
import { TagDataService } from '@shared/remote-data.service';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { TagsStat, TagsReport } from '@model/tags';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private _retrievedFromDB = false;
  private tags: string[] = [];
  private tagStat: TagsStat[] = [];
  private tagReport: TagsReport = {
    recently: [],
    mostUsed: [],
    all: [],
  };
  private _lastUsedTags: string[] = [];
  constructor(
    private tagDataService: TagDataService,
    private logbookInfoService: LogbookInfoService,
  ) {}

  private async _getTagsFromDB() {
    this.tagStat = await this.tagDataService.getTags(this.logbookInfoService.logbookInfo.id);
    this._retrievedFromDB = true;
  }

  async getTags() {
    console.log(this.tags);
    if (!this._retrievedFromDB) {
      this._retrievedFromDB = true;
      await this.updateTags();
    }
    this.tags = [];
    this.tagStat.forEach((tag) => {
      this.tags.push(tag.name);
    });
    return this.tags;
  }

  get lastUsedTags() {
    // last tags used by the user
    // note that this might not be the same as getLastTags
    return this._lastUsedTags;
  }

  set lastUsedTags(tags: string[]) {
    this._lastUsedTags = tags;
    this.addTags(tags);
    //TODO: add lastUsedTags to userPreferences
  }

  async getLastTags(config: any): Promise<string[]> {
    // get tags from last snippet entry in logbook
    let _lastTags: string[] = [];
    let snippet = await this.tagDataService.getLastEntry(config);
    if (snippet.length > 0) {
      if (snippet[0].tags) {
        _lastTags = snippet[0].tags;
      }
    }
    return _lastTags;
  }

  async updateTags() {
    await this._getTagsFromDB();
  }

  addTags(tags: string[]) {
    tags.forEach((tag) => {
      this.addTag(tag);
    });
    this.tagStat = _.orderBy(this.tagStat, ['count'], ['desc']);
    console.log(this.tagStat);
  }

  private addTag(tag: string) {
    let tagStatEntry = this.tagStat.find((e) => {
      return e.name == tag;
    });
    typeof tagStatEntry == 'undefined'
      ? this.tagStat.push({ name: tag, count: 1 })
      : (tagStatEntry.count += 1);
  }
}
