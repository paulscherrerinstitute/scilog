import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipGrid, MatChipRow, MatChipRemove, MatChipInput } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { Basesnippets } from '@model/basesnippets';
import { Logbooks } from '@model/logbooks';
import { Views } from '@model/views';
import { map, startWith } from 'rxjs/operators';
import {accessGroupsMemberValidator, ownerGroupMemberValidator} from '../view-settings.component';
import { ViewDataService } from '@shared/remote-data.service';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'view-edit',
    templateUrl: './view-edit.component.html',
    styleUrls: ['./view-edit.component.css'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatSelect, NgFor, MatOption, MatDivider, MatInput, NgIf, MatError, MatAutocompleteTrigger, MatAutocomplete, MatChipGrid, MatChipRow, MatIcon, MatChipRemove, MatChipInput, MatSlideToggle, MatButton, AsyncPipe]
})
export class ViewEditComponent implements OnInit {

  @Input()
  views: Views[];

  @Input()
  currentView: Views;

  @Input()
  logbook: Logbooks;

  @Input()
  availLocations: Basesnippets[];


  editFormGroup: UntypedFormGroup;
  formBuilder: UntypedFormBuilder;
  visible = true;
  selectable = true;
  removable = true;
  selectedLocation: any;
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  filteredAccessGroups: Observable<string[]>;
  accessGroupsSelected: string[] = [];
  accessGroupsAvail: string[] = [];
  currentLocation: Basesnippets = {};
  showSaveMessage = false;
  saveMessage: string = '';
  selectedView: Views = null;

  @ViewChild('accessGroupsInput') accessGroupsInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(fb: UntypedFormBuilder,
    private userPreferences: UserPreferencesService,
    private viewDataService: ViewDataService) {
    this.formBuilder = fb;
  }

  ngOnInit(): void {

    this.editFormGroup = this.formBuilder.group({
      name: new UntypedFormControl('', [Validators.required]),
      views: new UntypedFormControl('', [Validators.required]),
      description: new UntypedFormControl(''),
      location: new UntypedFormControl('', Validators.required),
      ownerGroup: new UntypedFormControl('', Validators.required),
      accessGroupsCtrl: new UntypedFormControl({value: '', disabled: true}),
      shareWithLocation: new UntypedFormControl({ value: false, disabled: true }),
      shareWithLogbook: new UntypedFormControl(false),
      applyCurrentView: new UntypedFormControl(false),
    });
    this.toggleEnableForms(false);


    this.availLocations.forEach(loc => {
      if (loc.id == this.logbook.location) {
        this.currentLocation = loc;
        this.userPreferences.userInfo.roles.forEach(role => {
          if (role == this.currentLocation.ownerGroup) {
            this.editFormGroup.get("shareWithLocation").setValue({ value: false, disabled: false });
          }
        })
      }
    })
    this.accessGroupsAvail = this.userPreferences.userInfo?.roles;
    this.filteredAccessGroups = this.editFormGroup.get('accessGroupsCtrl').valueChanges.pipe(startWith(null), map((accessGroup: string | null) => accessGroup ? this._filter(accessGroup) : this.accessGroupsAvail.slice()));
    this.editFormGroup.get('accessGroupsCtrl').setValidators([accessGroupsMemberValidator(this.accessGroupsAvail, this.accessGroupsSelected)]);
    this.editFormGroup.get('ownerGroup').setValidators([Validators.required, ownerGroupMemberValidator(this.accessGroupsAvail)]);
    
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

    this.editFormGroup.get('accessGroupsCtrl').setValue(null);
  }

  removeAccessGroup(accessGroup: string): void {
    const index = this.accessGroupsSelected.indexOf(accessGroup);

    if (index >= 0) {
      this.accessGroupsSelected.splice(index, 1);
    }
    this.editFormGroup.get('accessGroupsCtrl').updateValueAndValidity();
  }

  selectedAccessGroup(event: MatAutocompleteSelectedEvent): void {
    this.accessGroupsSelected.push(event.option.viewValue);
    this.accessGroupsInput.nativeElement.value = '';
    this.editFormGroup.get('accessGroupsCtrl').setValue(null);
  }

  private _filter(value: string): string[] {
    console.log(value)
    const filterValue = value.toLowerCase();

    return this.accessGroupsAvail.filter(accessGroup => accessGroup.toLowerCase().indexOf(filterValue) === 0);
  }

  selectView(id: any) {
    console.log(id)
    this.views.forEach(view => {
      if (view.id == id.value) {
        this.selectedView = view;
        this.updateForm();
      }
    })
    this.toggleEnableForms(true);
  }
  toggleEnableForms(enable: boolean){
    if (enable){
      this.editFormGroup.get('name').enable();
      this.editFormGroup.get('description').enable();
      this.editFormGroup.get('location').enable();
      this.editFormGroup.get('accessGroupsCtrl').enable();
      this.editFormGroup.get('ownerGroup').enable();
    } else {
      this.editFormGroup.get('name').disable();
      this.editFormGroup.get('description').disable();
      this.editFormGroup.get('location').disable();
      // this.editFormGroup.get('accessGroupsCtrl').disable();
      this.editFormGroup.get('ownerGroup').disable();
    }

  }

  updateForm(){
    if (this.selectedView != null){
      this.editFormGroup.get('name').setValue(this.selectedView.name);
      this.editFormGroup.get('description').setValue(this.selectedView.description);
      this.editFormGroup.get('location').setValue(this.selectedView.location);
      this.accessGroupsAvail = this.userPreferences.userInfo?.roles;
      if (this.selectedView.accessGroups.length > 0){
        this.editFormGroup.get('accessGroupsCtrl').setValue(this.selectedView.accessGroups);
      } else {
        this.editFormGroup.get('accessGroupsCtrl').setValue('');
      }
      this.editFormGroup.get('ownerGroup').setValue(this.selectedView.ownerGroup);
    }
  }

  async saveLogbook() {
    console.log(this.editFormGroup.get('shareWithLogbook'))
    let payload: Views = {
      name: this.editFormGroup.get('name').value,
      location: this.editFormGroup.get('location').value,
      ownerGroup: this.editFormGroup.get('ownerGroup').value,
      accessGroups: this.accessGroupsSelected,
      snippetType: "view",
      configuration: this.currentView.configuration
    }
    if (payload.ownerGroup == this.currentLocation.ownerGroup) {
      payload.parentId = this.currentLocation.id;
    } else {
      payload.parentId = this.logbook.id;
    }

    let data = await this.viewDataService.patchView(payload, this.currentView.id);
    console.log(payload)
    console.log(data);
    this.showSaveMessage = true;
    this.saveMessage = 'Saved successfully';
    setTimeout(() => {
      this.showSaveMessage = false;
    }, 5000)
  }

}
