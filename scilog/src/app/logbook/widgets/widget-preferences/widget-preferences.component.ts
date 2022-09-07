import { Component, OnInit, Input, Inject, ViewChild, NgZone, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tags } from '@model/metadata'
import { Observable, Subscription } from 'rxjs';
import { Basesnippets } from '@model/basesnippets';
import { map, startWith, take } from 'rxjs/operators';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { updateACLMemberValidator } from '@shared/settings/view-settings/view-settings.component';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { Logbooks } from '@model/logbooks';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { WidgetPreferencesDataService } from '@shared/remote-data.service';
import { WidgetItemConfig } from '@model/config';

@Component({
  selector: 'widget-preferences',
  templateUrl: './widget-preferences.component.html',
  styleUrls: ['./widget-preferences.component.scss']
})
export class WidgetPreferencesComponent implements OnInit {


  data: WidgetItemConfig;
  filters = new FormArray([]);
  options: FormGroup;
  filterBasics: FormGroup;
  hideMetadata = new FormControl(false);
  showSnippetHeader = new FormControl(false);
  readOnlyLogbook = new FormControl(false);
  hideRequiredControl = new FormControl(false);
  descendingOrder = new FormControl(false);
  floatLabelControl = new FormControl('auto');
  tag: Tags[] = [];
  additionalLogbooks: Logbooks[] = [];
  title = new FormControl('');
  widgetType = new FormControl('');
  snippetViewerControl = new FormControl();
  plotControl = new FormControl();
  additionalLogbooksCtrl = new FormControl();

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;

  snippetViewerOptions: Basesnippets[];
  plotOptions: Basesnippets[];
  subscriptions: Subscription[] = [];
  filteredOptions: Observable<Basesnippets[]>;
  filteredOptionsPlot: Observable<Basesnippets[]>;

  filteredLogbooks: Observable<Logbooks[]>;
  filteredAdditionalLogbooks: Observable<Logbooks[]>;
  filteredUpdateACL: Observable<string[]>;
  logbookUpdate: Observable<Logbooks[]>;
  updateACLAvail: string[] = [];

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('logbookInput') logbookInput: ElementRef<HTMLInputElement>;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];

  constructor(
    fb: FormBuilder,
    private dialogRef: MatDialogRef<WidgetPreferencesComponent>,
    private logbookInfo: LogbookInfoService,
    private userPreferences: UserPreferencesService,
    private dataService: WidgetPreferencesDataService,
    @Inject(MAT_DIALOG_DATA) data,
    private _ngZone: NgZone) {
    this.data = data.config;
    this.options = fb.group({
      hideRequired: this.hideRequiredControl,
      floatLabel: this.floatLabelControl,
      enableAdvanced: new FormControl(false),
    });
    this.filterBasics = fb.group({
      updateACL: new FormControl(''),
      logbook: new FormControl(''),
      description: new FormControl({ value: "", disabled: true })
    });

  }

  ngOnInit(): void {
    this.title.setValue(this.data.general.title);
    this.widgetType.setValue(this.data.general.type);

    if (this.data.filter.tags && this.data.filter.tags.length > 0) {
      this.data.filter.tags.forEach((tag: string) => {
        console.log(tag);
        this.tag.push({ name: tag });
      })
    }
    if (typeof this.data.view.hideMetadata != "undefined") {
      this.hideMetadata.setValue(this.data.view.hideMetadata);
    }
    if (typeof this.data.view.showSnippetHeader != "undefined") {
      this.showSnippetHeader.setValue(this.data.view.showSnippetHeader);
    }
    if (typeof this.data.general.readonly != "undefined") {
      this.readOnlyLogbook.setValue(this.data.general.readonly);
    }
    if (typeof this.data.view.order != "undefined") {
      let orderTag = this.data.view.order[0].split(" ")[1];
      console.log(this.data.view.order)
      console.log(orderTag)
      this.descendingOrder.setValue(this.orderTagToBoolean(orderTag));
    }
    this.getSnippetViewerOptions();

    this.getFilterOptionsPlot();

    // basic filter forms

    this.setupLogbookSelection();

    // target logbook description
    this.subscriptions.push(this.filterBasics.get('logbook').valueChanges.subscribe(logbook => {
      if (logbook && logbook.description) {
        this.filterBasics.get('description').setValue(logbook.description);
      } else {
        this.filterBasics.get('description').setValue("");
      }
    }));

    // ownerGroups
    this.updateACLAvail = this.userPreferences.userInfo?.roles;
    this.filteredUpdateACL = this.filterBasics.get('updateACL').valueChanges.pipe(startWith(null), map((ownerGroup: string | null) => ownerGroup ? this._filterOwnerGroups(ownerGroup) : this.updateACLAvail.slice()));
    this.filterBasics.get('ownerGroup').setValidators([updateACLMemberValidator(this.updateACLAvail)]);
    // let ownerGroupIndex = Object.keys(this.data.filters).find(k => this.data.filters[k].name == 'ownerGroup');
    // if (typeof ownerGroupIndex != 'undefined') {
    //   this.filterBasics.get('ownerGroup').setValue(this.data.filters[ownerGroupIndex].value);
    // } 
  }

  async getSnippetViewerOptions() {
    let data = await this.dataService.getSnippetsForLogbook(this.logbookInfo.logbookInfo.id);
    // TODO this should be done in the backend, not here!
    this.snippetViewerOptions = [];
    data.forEach(snippet => {
      if (snippet?.dashboardName) {
        this.snippetViewerOptions.push(snippet)
      }
    })
    this.filteredOptions = this.snippetViewerControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filter(name) : this.snippetViewerOptions.slice())
    );
    console.log(this.snippetViewerOptions)
  }

  async getFilterOptionsPlot() {
    let data = await this.dataService.getPlotSnippets(this.logbookInfo.logbookInfo.id);
    console.log(data)
    this.plotOptions = data;
    this.filteredOptionsPlot = this.plotControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filter(name) : this.plotOptions.slice())
    );
  }

  async setupLogbookSelection() {
    await this.logbookInfo.getAvailLogbooks();
    // taget logbooks
    this.filteredLogbooks = this.filterBasics.get('logbook').valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filterLogbooks(name) : this.logbookInfo.availLogbooks.slice())
    );
    // set up target logbook
    this.logbookInfo.availLogbooks.forEach(log => {
      if (this.data.filter.targetId == log.id) {
        this.filterBasics.get('logbook').setValue(log);
      }
    });

    // set up additional logbooks
    this.logbookInfo.availLogbooks.forEach(log => {
      this.data.filter.additionalLogbooks?.forEach(selLog => {
        if (selLog == log.id) {
          this.additionalLogbooks.push(log);
        }
      })
    });
    // additional logbooks
    this.filteredAdditionalLogbooks = this.additionalLogbooksCtrl.valueChanges.pipe(startWith(null), map((logbook: string) => logbook ? this._filterAdditionalLogbooks(logbook) : this._getAvailAdditionalLogbooks()));
  }

  selectedWidgetType($event) {
    this.widgetType.setValue($event.value);
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
  }

  _getAvailAdditionalLogbooks() {
    let availLogbooks = this.logbookInfo.availLogbooks;
    if (this.filterBasics.get('logbook').value.id) {
      availLogbooks = availLogbooks.filter((log) => {
        return log.id != this.filterBasics.get('logbook').value.id
      })
    }
    if (this.additionalLogbooks.length > 0) {
      availLogbooks = availLogbooks.filter((log) => {
        return this.additionalLogbooks.indexOf(log) < 0;
      })
    }
    if ((this.additionalLogbooksCtrl.value != null) && (this.additionalLogbooksCtrl.value?.id)) {
      availLogbooks = availLogbooks.filter(log => {
        return log.id != this.additionalLogbooksCtrl.value.id;
      })
    }
    return availLogbooks;
  }

  addLogbook($event: any): void {
    const input = $event.input;
    const value = $event.value;

    // if ((value || '').trim()) {
    console.log($event);
    this.additionalLogbooks.push($event.option.value);
    // }

    this.logbookInput.nativeElement.value = "";
  }

  addNewFormGroupAfterEmpty() {
    if (this.filters.at(this.filters.length - 1).value.name != "" && this.filters.length < 20) {
      this.addFormGroup();
    }
  }

  addFormGroup() {
    const group = new FormGroup({
      name: new FormControl(''),
      operator: new FormControl(''),
      value: new FormControl('')
    });
    this.filters.push(group);
  }

  removeTag(tag: Tags): void {
    const index = this.tag.indexOf(tag);

    if (index >= 0) {
      this.tag.splice(index, 1);
    }
  }
  removeLogbook(logbook: Logbooks): void {
    const index = this.additionalLogbooks.indexOf(logbook);

    if (index >= 0) {
      this.additionalLogbooks.splice(index, 1);
    }
  }
  close() {
    this.dialogRef.close();
  }

  private _filter(value: string): Basesnippets[] {
    const filterValue = value.toLowerCase();
    return this.snippetViewerOptions.filter(option => option?.dashboardName && option.dashboardName.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterOwnerGroups(value: string): string[] {
    console.log(value)
    const filterValue = value.toLowerCase();

    return this.updateACLAvail.filter(ownerGroup => ownerGroup.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterAdditionalLogbooks(value: string): Logbooks[] {
    console.log(value);
    let additionalLogbooks = this._getAvailAdditionalLogbooks();

    return additionalLogbooks.filter(log => {
      if (typeof value == 'string') {
        if (log?.name) {
          return (log?.name.toLowerCase().includes(value.toLowerCase()) || (log?.description.toLowerCase().includes(value.toLowerCase())) || (log?.updateACL.includes(value.toLowerCase())));
        }
        return false;
      } else {
        return true;
      }
    }
    );
  }

  private _filterLogbooks(value: string): Logbooks[] {
    console.log(value)
    const filterValue = value.toLowerCase();
    return this.logbookInfo.availLogbooks.filter(log => {
      if (log?.name) {
        return log?.name.toLowerCase().includes(value.toLowerCase());
      }
      return false;
    });
  }

  displayFnSnippetSelection(snippet: Basesnippets): string {
    return snippet && snippet.dashboardName ? snippet.dashboardName : '';
  }

  displayFnSnippetSelectionPlot(snippet: Basesnippets): string {
    return snippet && snippet["name"] ? snippet["name"] : '';
  }

  displayFnLogbookSelection(logbook: Logbooks): string {
    return logbook && logbook.name ? logbook.name : '';
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  applyChanges($event) {
    this.data.general.title = this.title.value;
    this.data.general.type = this.widgetType.value;


    switch (this.data.general.type) {
      case 'logbook':
        this.data.filter.targetId = this.filterBasics.get('logbook').value.id;
        this.data.filter.additionalLogbooks = this.additionalLogbooks.map(log => log.id);
        break;
      case 'snippetViewer':
        this.data.filter.targetId = this.snippetViewerControl.value?.id;
        break;
      case 'graph':
        this.data.filter.targetId = this.plotControl.value?.id;
        break;
      default:
        break;
    }
    // this.data.filter.targetId = this.filterBasics.get('logbook').value.id;
    this.data.filter.tags = this.tag.map(tag => tag.name);
    this.data.view.hideMetadata = this.hideMetadata.value;
    this.data.view.showSnippetHeader = this.showSnippetHeader.value;
    this.data.general.readonly = this.readOnlyLogbook.value;
    this.data.view.order = ['defaultOrder ' + this.booleanToOrderTag(this.descendingOrder.value)];
    console.log(this.data);
    this.dialogRef.close(this.data);
  }

  booleanToOrderTag(descending: boolean): string {
    return descending ? "DESC" : "ASC"
  }

  orderTagToBoolean(orderTag: string) {
    return orderTag == "DESC" ? true : false;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    })
  }
}
