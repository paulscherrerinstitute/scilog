import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AsyncValidator, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, Subscription } from 'rxjs';
import { LogbookInfoService } from '@shared/logbook-info.service';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { ViewsService } from '@shared/views.service';
import { Basesnippets } from '@model/basesnippets';
import { Logbooks } from '@model/logbooks';
import { Views } from '@model/views';
import { map, startWith } from 'rxjs/operators';
import { LogbookDataService, ViewDataService } from '@shared/remote-data.service';




export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}

export function existingNameValidator(views: Views[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const viewsForbidden = (view: Views) => view.name == control.value;
    const forbidden = views.some(viewsForbidden);
    // console.log(forbidden)
    // console.log(views)
    return forbidden ? { existingName: { value: control.value } } : null;
  };
}

export function ownerGroupMemberValidator(groups: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = !groups.includes(control.value);
    return forbidden ? { forbiddenGroup: { value: control.value } } : null;
  };
}

export function accessGroupsMemberValidator(groups: string[], chips: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const groupEntriesForbidden = (chip: string) => !groups.includes(chip);
    const forbidden = ((control.value!=null) && (control.value !== "")&& (!groups.includes(control.value))) || (chips.length > 0 && chips.some(groupEntriesForbidden));
    console.log(typeof control.value)
    console.log(control.value)
    console.log(chips)
    return forbidden ? { forbiddenGroup: { value: control.value } } : null;
  };
}


@Component({
  selector: 'app-view-settings',
  templateUrl: './view-settings.component.html',
  styleUrls: ['./view-settings.component.css']
})
export class ViewSettingsComponent implements OnInit {

  sidenavOpened = true;
  sidenavOver = 'side';
  views: Views[] = [];
  viewFormGroup: UntypedFormGroup;


  selectedLocation: any;
  subscriptions: Subscription[] = [];
  availLocations: Basesnippets[] = [];
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  filteredAccessGroups: Observable<string[]>;
  accessGroupsSelected: string[] = [];
  accessGroupsAvail: string[] = [];
  logbook: Logbooks;
  currentLocation: Basesnippets = {};
  showSaveMessage = false;
  saveMessage: string = '';
  formBuilder: UntypedFormBuilder;


  @ViewChild('accessGroupsInput') accessGroupsInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(public viewService: ViewsService,
    fb: UntypedFormBuilder,
    private logbookService: LogbookInfoService,
    private userPreferences: UserPreferencesService,
    private logbookDataService: LogbookDataService,
    private viewDataService: ViewDataService) {
    this.formBuilder = fb;

  }

  ngOnInit(): void {
    if (this.viewService.views.length > 0){
      this.views = JSON.parse(JSON.stringify(this.viewService.views));
    }
    let indexToRemove = null;
    for (let index = 0; index < this.views.length; index++) {
      if (this.views[index].name == this.views[index].ownerGroup + "_personal"){
        indexToRemove = index;
      }
    }
    if (indexToRemove != null){
      this.views.splice(indexToRemove, 1);
    }

    this.logbook = this.logbookService.logbookInfo
    this.getData();

    this.viewFormGroup = this.formBuilder.group({
      name: new UntypedFormControl('', [Validators.required]),
      description: new UntypedFormControl(''),
      location: new UntypedFormControl('', Validators.required),
      ownerGroup: new UntypedFormControl('', Validators.required),
      accessGroupsCtrl: new UntypedFormControl(''),
      enableAdvanced: new UntypedFormControl({ value: false, disabled: false }),
      shareWithLocation: new UntypedFormControl({ value: false, disabled: true }),
      shareWithLogbook: new UntypedFormControl(false),
    });

  }

  async getData() {
    
    let data = await this.logbookDataService.getLocations();
    if (typeof data[0].subsnippets != "undefined"){
      this.availLocations = data[0].subsnippets;
      this.availLocations.forEach(loc => {
        if (loc.id == this.logbook.location) {
          this.currentLocation = loc;
          this.userPreferences.userInfo.roles.forEach(role => {
            if (role == this.currentLocation.ownerGroup) {
              this.viewFormGroup.get("shareWithLocation").setValue({ value: false, disabled: false });
            }
          })
        }
      })
      this.setDefaults();
    }

  }

  setDefaults() {
    this.viewFormGroup.get('name').setValue(this.userPreferences.userInfo.username);
    this.viewFormGroup.get('ownerGroup').setValue(this.userPreferences.userInfo.username);
    this.accessGroupsSelected = [];
    this.viewFormGroup.get('location').setValue(this.currentLocation.id);
    this.accessGroupsAvail = this.userPreferences.userInfo?.roles;
    this.filteredAccessGroups = this.viewFormGroup.get('accessGroupsCtrl').valueChanges.pipe(startWith(null), map((accessGroup: string | null) => accessGroup ? this._filter(accessGroup) : this.accessGroupsAvail.slice()));
    
    this.viewFormGroup.get('name').setValidators([Validators.required, existingNameValidator(this.views), forbiddenNameValidator(/_personal/i)])
    this.viewFormGroup.get('accessGroupsCtrl').setValidators([accessGroupsMemberValidator(this.accessGroupsAvail, this.accessGroupsSelected)]);
    this.viewFormGroup.get('ownerGroup').setValidators([Validators.required, ownerGroupMemberValidator(this.accessGroupsAvail)]);
    this.viewFormGroup.get('name').updateValueAndValidity();
  }

  selectLocation(id: any) {
    console.log("locationId:", id.value);
    this.availLocations.forEach(loc => {
      if (loc.id == id.value) {
        this.selectedLocation = loc;
        console.log(this.selectedLocation);
      }
    })
  }

  addAccessGroup(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add accessGroup
    if ((value || '').trim()) {
      this.accessGroupsSelected.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.viewFormGroup.get('accessGroupsCtrl').setValue(null);
  }

  removeAccessGroup(accessGroup: string): void {
    const index = this.accessGroupsSelected.indexOf(accessGroup);

    if (index >= 0) {
      this.accessGroupsSelected.splice(index, 1);
    }
    this.viewFormGroup.get('accessGroupsCtrl').updateValueAndValidity();
  }

  selectedAccessGroup(event: MatAutocompleteSelectedEvent): void {
    this.accessGroupsSelected.push(event.option.viewValue);
    this.accessGroupsInput.nativeElement.value = '';
    this.viewFormGroup.get('accessGroupsCtrl').setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.accessGroupsAvail.filter(accessGroup => accessGroup.toLowerCase().indexOf(filterValue) === 0);
  }

  shareWithLogbookSlide() {
    console.log("change");
    console.log(this.viewFormGroup.get('shareWithLogbook'))
    if (this.viewFormGroup.get('shareWithLogbook').value){
      this.viewFormGroup.get('ownerGroup').setValue(this.logbook.ownerGroup);
    } else {
      this.viewFormGroup.get('ownerGroup').setValue(this.userPreferences.userInfo.username);
      this.viewFormGroup.get('accessGroupsCtrl').setValue('');
    }

  }

  shareWithLocationSlide($event) {
    if (this.viewFormGroup.get('shareWithLocation').value){
      this.viewFormGroup.get('shareWithLogbook').setValue(true)
      this.viewFormGroup.get('ownerGroup').setValue(this.currentLocation.ownerGroup);
      this.viewFormGroup.get('accessGroupsCtrl').setValue(this.currentLocation.accessGroups);
    } else {
      this.shareWithLogbookSlide();
    }

  }

  async saveLogbook() {
    console.log(this.viewFormGroup.get('shareWithLogbook'))
    let payload: Views = {
      name: this.viewFormGroup.get('name').value,
      location: this.viewFormGroup.get('location').value,
      ownerGroup: this.viewFormGroup.get('ownerGroup').value,
      accessGroups: this.accessGroupsSelected,
      snippetType: "view",
      configuration: this.viewService.view.configuration
    }
    if (payload.ownerGroup == this.currentLocation.ownerGroup){
      payload.parentId = this.currentLocation.id;
    } else {
      payload.parentId = this.logbook.id;
    }
    let data = await this.viewDataService.postView(payload);
    console.log(payload)
    console.log(data);
    console.log(this.viewService.view)
    this.showSaveMessage = true;
    this.saveMessage = 'Saved successfully';
    setTimeout(() => {
      this.showSaveMessage = false;
    }, 5000)
  }

}
