import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef, SimpleChange } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { Tags } from '@model/metadata';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { TagService } from '../tag.service';
import { UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ViewsService } from '@shared/views.service';
import { WidgetItemConfig } from '@model/config';

@Component({
    selector: 'tag-editor',
    templateUrl: './tag-editor.component.html',
    styleUrls: ['./tag-editor.component.scss'],
    standalone: false
})
export class TagEditorComponent implements OnInit {

  @Input()
  tagIn: string[] = []

  @Input()
  configIndex: number = null;

  @Input()
  config: WidgetItemConfig;

  @Input()
  syncAtStart = true;

  tag: Tags[] = [];
  lastTags: Tags[] = [];
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  tagsCtrl = new UntypedFormControl();
  filteredTags: Observable<string[] | Tags[]>;
  tagsAvail: Tags[] = [];
  currentViewSubscription: Subscription = null;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;


  @Output() tagsUpdate = new EventEmitter<string[]>();


  constructor(private tagService: TagService,
    private views: ViewsService
    ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadLastTags();
  }

  public async loadData() {
    this.tag = this.stringsToTags(this.tagIn);
    // console.log(this.tagService.getTags());
    this.tagsAvail = this.stringsToTags(await this.tagService.getTags());
    console.log(this.tagsAvail);
    this.filteredTags = this.tagsCtrl.valueChanges.pipe(startWith(null), map((tag: string) => tag ? this._filter(tag) : this.tagsAvail.slice()));
  }

  private async loadLastTags() {
    console.log(this.config)
    if (this.configIndex != null){
      if (this.currentViewSubscription != null) {
        this.currentViewSubscription.unsubscribe();
      }
      this.currentViewSubscription = this.views.currentWidgetConfigs.subscribe(async config => {
        if (config != null) {
          this.config = config[this.configIndex].config;
          this._syncWithTags();
        }
       })
    } else if (typeof this.config != 'undefined') {
      this._syncWithTags();
    }

  };

  private async _syncWithTags(){
    await this._getLastTags();
    if (this.syncAtStart){
      this.syncWithLastEntry();
    }
  }

  private async _getLastTags(){
    let _lastTags = await this.tagService.getLastTags(this.config);
    this.lastTags = this.stringsToTags(_lastTags);
  }

  addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.tag.push({ name: value.trim() });
    }

    if (input) {
      input.value = '';
    }
    this.tagsUpdate.emit(this.tagsToStrings(this.tag));
  }

  remove(tag: Tags): void {
    const index = this.tag.indexOf(tag);

    if (index >= 0) {
      this.tag.splice(index, 1);
    }
    this.tagsUpdate.emit(this.tagsToStrings(this.tag));
  }

  tagsToStrings(tagsIn: Tags[]) {
    let out: string[] = [];
    tagsIn.forEach(data => {
      out.push(data.name);
    });
    return out;
  }

  stringsToTags(stringsIn: string[]) {
    let tags: Tags[] = [];
    stringsIn.forEach(data => {
      let newTag: Tags = {
        name: data
      };
      tags.push(newTag);
    });
    return tags;
  }

  selectedTags(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.viewValue)
    let tagEntry = this.tag.find((tag: Tags) => { return tag.name == event.option.viewValue });
    if (typeof tagEntry == 'undefined') {
      console.log(this.tag)
      console.log(tagEntry);
      let newTag = this.stringsToTags(Array(event.option.viewValue));
      this.tag.push(newTag[0]);
    }
    this.tagInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);
    console.log(this.tag);
    this.tagsUpdate.emit(this.tagsToStrings(this.tag));
  }

  private _filter(value: any) {
    console.log(value);
    if (typeof value != 'string') {
      value = value.name;
    }
    const filterValue = value.toLowerCase();

    return this.tagsAvail.filter((tag: Tags) => {
      return (tag.name.toLowerCase().indexOf(filterValue) === 0);
    });
  }

  async syncWithLastEntry(){
    await this._getLastTags();
    this.tag = JSON.parse(JSON.stringify(this.lastTags));
    this.tagsUpdate.emit(this.tagsToStrings(this.tag));
  }
  
  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    this.tag = this.stringsToTags(changes.tagIn.currentValue);
  }

}
