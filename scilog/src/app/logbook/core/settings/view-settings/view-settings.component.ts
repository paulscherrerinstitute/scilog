import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AsyncValidator, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
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

export function updateACLMemberValidator(groups: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = !groups.includes(control.value);
    return forbidden ? { forbiddenGroup: { value: control.value } } : null;
  };
}

export function readACLMemberValidator(groups: string[], chips: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const groupEntriesForbidden = (chip: string) => !groups.includes(chip);
    const forbidden = ((control.value != null) && (control.value !== "") && (!groups.includes(control.value))) || (chips.length > 0 && chips.some(groupEntriesForbidden));
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
  viewFormGroup: FormGroup;


  selectedLocation: any;
  subscriptions: Subscription[] = [];
  availLocations: Basesnippets[] = [];
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  filteredAccessGroups: Observable<string[]>;
  readACLAvailSelected: string[] = [];
  readACLAvail: string[] = [];
  logbook: Logbooks;
  currentLocation: Basesnippets = {};
  showSaveMessage = false;
  saveMessage: string = '';
  formBuilder: FormBuilder;


  @ViewChild('accessGroupsInput') accessGroupsInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(public viewService: ViewsService,
    fb: FormBuilder,
    private logbookService: LogbookInfoService,
    private userPreferences: UserPreferencesService,
    private logbookDataService: LogbookDataService,
    private viewDataService: ViewDataService) {
    this.formBuilder = fb;

  }

  ngOnInit(): void {
    if (this.viewService.views.length > 0) {
      this.views = JSON.parse(JSON.stringify(this.viewService.views));
    }
    let indexToRemove = null;
    for (let index = 0; index < this.views.length; index++) {
      if (this.views[index].name == this.userPreferences.userInfo.username + "_personal") {
        indexToRemove = index;
      }
    }
    if (indexToRemove != null) {
      this.views.splice(indexToRemove, 1);
    }

    this.logbook = this.logbookService.logbookInfo
    this.getData();

    this.viewFormGroup = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      location: new FormControl('', Validators.required),
      updateACL: new FormControl('', Validators.required),
      readACLCtrl: new FormControl(''),
      enableAdvanced: new FormControl({ value: false, disabled: false }),
      shareWithLocation: new FormControl({ value: false, disabled: true }),
      shareWithLogbook: new FormControl(false),
    });

  }

  async getData() {

    let data = await this.logbookDataService.getLocations();
    if (typeof data[0].subsnippets != "undefined") {
      this.availLocations = data[0].subsnippets;
      this.availLocations.forEach(loc => {
        if (loc.id == this.logbook.location) {
          this.currentLocation = loc;
          this.userPreferences.userInfo.roles.forEach(role => {
            if (this.currentLocation.updateACL.includes(role)) {
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
    this.viewFormGroup.get('updateACL').setValue(this.userPreferences.userInfo.username);
    this.readACLAvailSelected = [];
    this.viewFormGroup.get('location').setValue(this.currentLocation.id);
    this.readACLAvail = this.userPreferences.userInfo?.roles;
    this.filteredAccessGroups = this.viewFormGroup.get('readACLCtrl').valueChanges.pipe(startWith(null), map((accessGroup: string | null) => accessGroup ? this._filter(accessGroup) : this.readACLAvail.slice()));

    this.viewFormGroup.get('name').setValidators([Validators.required, existingNameValidator(this.views), forbiddenNameValidator(/_personal/i)])
    this.viewFormGroup.get('readACLCtrl').setValidators([readACLMemberValidator(this.readACLAvail, this.readACLAvailSelected)]);
    this.viewFormGroup.get('updateACL').setValidators([Validators.required, updateACLMemberValidator(this.readACLAvail)]);
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
      this.readACLAvailSelected.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.viewFormGroup.get('accessGroupsCtrl').setValue(null);
  }

  removeAccessGroup(accessGroup: string): void {
    const index = this.readACLAvailSelected.indexOf(accessGroup);

    if (index >= 0) {
      this.readACLAvailSelected.splice(index, 1);
    }
    this.viewFormGroup.get('accessGroupsCtrl').updateValueAndValidity();
  }

  selectedAccessGroup(event: MatAutocompleteSelectedEvent): void {
    this.readACLAvailSelected.push(event.option.viewValue);
    this.accessGroupsInput.nativeElement.value = '';
    this.viewFormGroup.get('accessGroupsCtrl').setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.readACLAvail.filter(accessGroup => accessGroup.toLowerCase().indexOf(filterValue) === 0);
  }

  shareWithLogbookSlide() {
    console.log("change");
    console.log(this.viewFormGroup.get('shareWithLogbook'))
    if (this.viewFormGroup.get('shareWithLogbook').value) {
      this.viewFormGroup.get('updateACL').setValue(this.logbook.updateACL);
    } else {
      this.viewFormGroup.get('updateACL').setValue(this.userPreferences.userInfo.username);
      this.viewFormGroup.get('accessGroupsCtrl').setValue('');
    }

  }

  shareWithLocationSlide($event) {
    if (this.viewFormGroup.get('shareWithLocation').value) {
      this.viewFormGroup.get('shareWithLogbook').setValue(true)
      this.viewFormGroup.get('updateACL').setValue(this.currentLocation.updateACL);
      this.viewFormGroup.get('accessGroupsCtrl').setValue(this.currentLocation.readACL);
    } else {
      this.shareWithLogbookSlide();
    }

  }

  async saveLogbook() {
    console.log(this.viewFormGroup.get('shareWithLogbook'))
    let payload: Views = {
      name: this.viewFormGroup.get('name').value,
      location: this.viewFormGroup.get('location').value,
      createACL: this.viewFormGroup.get('updateACL').value,
      readACL: this.readACLAvailSelected,
      updateACL: this.viewFormGroup.get('updateACL').value,
      deleteACL: this.viewFormGroup.get('updateACL').value,
      shareACL: this.viewFormGroup.get('updateACL').value,
      adminACL: this.viewFormGroup.get('updateACL').value,
      snippetType: "view",
      configuration: this.viewService.view.configuration
    }
    if (payload.updateACL == this.currentLocation.updateACL) {
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
