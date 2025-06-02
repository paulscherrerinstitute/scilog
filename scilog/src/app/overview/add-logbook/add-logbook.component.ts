import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { CompactType, DisplayGrid, GridsterConfig, GridsterItem,GridType } from 'angular-gridster2';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { Logbooks } from '@model/logbooks';
import { LogbookDataService, LogbookItemDataService } from '@shared/remote-data.service';
import { SnackbarService } from 'src/app/core/snackbar.service';
import { IsAllowedService } from '../is-allowed.service';

function ownerGroupMemberValidator(groups: string[]): ValidatorFn {
  return (control: AbstractControl): { forbiddenGroup: {value: string} } | null => {
    const forbidden = control.value && 
      control.value !== 'any-authenticated-user' &&
      !groups.includes(control.value);
    return forbidden ? { forbiddenGroup: { value: control.value } } : null;
  };
}

function groupCreationValidator(control: AbstractControl): { anyAuthGroup: {value: string | string[]} } | null {
    const forbidden = control.value?.includes('any-authenticated-user');
    return forbidden ? { anyAuthGroup: { value: control.value } } : null;
}

@Component({
    selector: 'app-add-logbook',
    templateUrl: './add-logbook.component.html',
    styleUrls: ['./add-logbook.component.css'],
    providers: [IsAllowedService],
    standalone: false
})
export class AddLogbookComponent implements OnInit {


  logbook: Logbooks;

  // general form settings and variables
  optionsFormGroup: UntypedFormGroup;
  fileId: string = '';



  imageToShow: string | ArrayBuffer;
  imageLoaded = false;
  customImageLoaded = false;
  subscriptions: Subscription[] = [];
  availLocations: any[] = [];
  selectedLocation: any;

  thumbnailText = 'Add thumbnail';
  uploadThumbnailFile: File = null

  // grid settings
  formGrid: Array<GridsterItem>;

  optionsGrid: GridsterConfig = {
    gridType: GridType.Fit,
    compactType: CompactType.None,
    margin: 2,
    outerMargin: true,
    outerMarginTop: null,
    outerMarginRight: null,
    outerMarginBottom: null,
    outerMarginLeft: null,
    useTransformPositioning: true,
    mobileBreakpoint: 640,
    keepFixedHeightInMobile: false,
    keepFixedWidthInMobile: false,
    scrollSensitivity: 10,
    scrollSpeed: 20,
    enableEmptyCellClick: false,
    enableEmptyCellContextMenu: false,
    enableEmptyCellDrop: false,
    enableEmptyCellDrag: false,
    enableOccupiedCellDrop: false,
    emptyCellDragMaxCols: 50,
    emptyCellDragMaxRows: 50,
    ignoreMarginInRow: true,
    draggable: {
      enabled: false,
    },
    resizable: {
      enabled: false,
    },
    swap: true,
    pushItems: true,
    disablePushOnDrag: false,
    disablePushOnResize: false,
    pushDirections: { north: true, east: true, south: true, west: true },
    pushResizeItems: false,
    displayGrid: DisplayGrid.None,
    disableWindowResize: false,
    disableWarnings: false,
    scrollToNewItems: true
  };

  // chips for accessGroups
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  accessGroupsCtrl = new UntypedFormControl();
  filteredAccessGroups: Observable<string[]>;
  filteredOwnerGroups: Observable<string[]>;
  accessGroupsAvail: string[] = [];

  @ViewChild('accessGroupsInput') accessGroupsInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  constructor(
    fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AddLogbookComponent>,
    private logbookItemDataService: LogbookItemDataService,
    private userPreferences: UserPreferencesService,
    private logbookDataService: LogbookDataService,
    private snackBar: SnackbarService,
    protected isActionAllowed: IsAllowedService,
    @Inject(MAT_DIALOG_DATA) data) {
    this.optionsFormGroup = fb.group({
      hideRequired: new UntypedFormControl(false),
      floatLabel: new UntypedFormControl('auto'),
      title: new UntypedFormControl('', Validators.required),
      description: new UntypedFormControl(''),
      location: new UntypedFormControl('', Validators.required),
      ownerGroup: new UntypedFormControl('', Validators.required),
      accessGroups: new UntypedFormControl([]),
      isPrivate: new UntypedFormControl(false)
    });
    this.logbook = data;
    this.isActionAllowed.snippet = data;
    console.log("inputData: ", data);
  }

  ngOnInit(): void {
    this.getLocations();
    this.setDefaults();
  }

  private getForm(value: string) {
    return this.optionsFormGroup.get(value);
  }

  private setForm(toKey: string, fromKey?: string) {
    this.getForm(toKey).setValue(this.logbook[fromKey ?? toKey]);
  }

  get accessGroups() {
    return this.getForm('accessGroups');
  }

  private setOwnerGroupWithEditability() {
    this.setForm('ownerGroup');
    if (this.isActionAllowed.canChangeOwnerGroup()) 
      return
    this.getForm('ownerGroup').disable();
  }

  private setWithEditability(toKey: string) {
    let fromKey: string;
    if (toKey === 'title') fromKey = 'name';
    this.setForm(toKey, fromKey ?? toKey);
    if (this.isActionAllowed.tooltips.expired) this.getForm(toKey).disable();
  }

  setDefaults(){
    this.accessGroupsAvail = this.userPreferences.userInfo?.roles;
    if (!this.isActionAllowed.isAdmin())
      this.getForm('ownerGroup').addValidators(ownerGroupMemberValidator(this.accessGroupsAvail));
    if (this.logbook) {
      this.isActionAllowed.isNotExpired();
      ['title', 'description', 'location', 'isPrivate'].map(field => this.setWithEditability(field));
      this.setOwnerGroupWithEditability();
      this.accessGroups.setValue(this.logbook.accessGroups);
      this.fileId = this.logbook.thumbnail;
      if (this.fileId) {
        this.getImageFromService();
      }
      console.log("editing existing logbook");
    }
    else {
      this.accessGroups.addValidators(groupCreationValidator);
      this.getForm('ownerGroup').addValidators(groupCreationValidator);
      this.accessGroupsAvail = this.accessGroupsAvail.filter((g: string) => g !== 'any-authenticated-user');
    }
    this.filteredAccessGroups = this.accessGroupsCtrl.valueChanges.pipe(startWith(null), map((accessGroup: string | null) => accessGroup ? this._filter(accessGroup) : this.accessGroupsAvail.slice()));
    this.filteredOwnerGroups = this.getForm('ownerGroup').valueChanges.pipe(startWith(null), map((accessGroup: string | null) => accessGroup ? this._filter(accessGroup) : this.accessGroupsAvail.slice()));
  }

  async getLocations(){
    let data = await this.logbookDataService.getLocations();
    if (data.length > 0){
      this.availLocations = data[0].subsnippets;
    }
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.imageToShow = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  async getImageFromService() {
    this.imageLoaded = false;
    let data = await this.logbookItemDataService.getImage(this.fileId);
    this.createImageFromBlob(data);
    this.showThumbnail();
    this.uploadThumbnailFile = null;
  }


  close() {
    this.dialogRef.close();
  }

  async addLogbook($event) {

    if (this.optionsFormGroup.invalid) {
      console.log("form invalid")
      const invalidKeys = [];
      for (const key in this.optionsFormGroup.controls) {
          if (this.getForm(key).invalid){
            invalidKeys.push(key);
            this.getForm(key).setErrors({'required': true});
          }
      }
      this.showSnackbarMessage(`Invalid keys: '${invalidKeys}'`, 'warning');
      return;
    }


    let logbookId: string = null;
    if ((this.logbook != null) && (this.logbook.id)) {
      logbookId = this.logbook.id;
    }
    this.logbook = {
      name: this.getForm('title').value,
      location: this.getForm('location').value,
      ownerGroup: this.getForm('ownerGroup').value,
      accessGroups: this.accessGroups.value,
      isPrivate: this.getForm('isPrivate').value,
      description: this.getForm('description').value
    }

    let fileData: {id: string};
    // now that we have the id, let's upload the image
    if (this.uploadThumbnailFile != null) {
      // upload selected file
      let formData = new FormData();
      if (this.logbook.ownerGroup)
        formData.append('fields', JSON.stringify({accessGroups: [this.logbook.ownerGroup]}))
      formData.append('file', this.uploadThumbnailFile);
      fileData = await this.logbookDataService.uploadLogbookThumbnail(formData);
    }

    this.logbook.thumbnail = fileData?.id ?? this.fileId;

    if (logbookId != null) {
      // update logbook
      try {
        await this.logbookDataService.patchLogbook(logbookId, this.logbook);
      } catch (error) {
        console.log(error);
        this.showSnackbarMessage('Error while updating the logbook. If the error persists contact an administrator', 'warning');
        return;
      }
      finally {
        this.logbook.id = logbookId;
      }
      this.showSnackbarMessage('Edit successful', 'resolved')
    } else {
      // create new logbook
      try {
        let data = await this.logbookDataService.postLogbook(this.logbook);
        this.logbook.id = data.id;
      } catch (error) {
        console.log(error);
        this.showSnackbarMessage('Error while creating the logbook. If the error persists contact an administrator', 'warning');
        return;
      }
      this.showSnackbarMessage('Creation successful', 'resolved');
    }
    this.dialogRef.close(this.logbook);
  }

  private showSnackbarMessage(message: string, messageClass: 'warning' | 'resolved') {
    return this.snackBar._showMessage({
      message: message,
      panelClass: [`${messageClass}-snackbar`], 
      action: 'Dismiss',
      show: true,
      duration: 4000,
      type: 'serverMessage',
      horizontalPosition: 'center',
      verticalPosition: 'top',
    })
  }

  selectLocation(id: any) {
    console.log("locationId:", id.value);
    this.availLocations.forEach(loc => {
      if (loc.id == id.value) {
        this.selectedLocation = loc;
        console.log(this.selectedLocation);
        if (!this.customImageLoaded) {
          console.log(this.selectedLocation)
          if (this.selectedLocation?.files?.[0]) {
            this.fileId = this.selectedLocation?.files[0].fileId;
            this.getImageFromService();
          } else {
            // make sure to delete the image from previous selections
            this.imageToShow = null;
            this.hideThumbnail();
          }
        }
      }
    })


  }

  addAccessGroup(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add accessGroup
    if ((value || '').trim()) {
      this.accessGroups.value.push(value.trim());
      this.accessGroups.updateValueAndValidity();
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.accessGroupsCtrl.setValue(null);
  }

  removeAccessGroup(accessGroup: string): void {
    const index = this.accessGroups.value.indexOf(accessGroup);

    if (index >= 0) {
      this.accessGroups.value.splice(index, 1);
      this.accessGroups.updateValueAndValidity();
    }
  }

  selectedAccessGroup(event: MatAutocompleteSelectedEvent): void {
    this.accessGroups.value.push(event.option.viewValue);
    this.accessGroups.updateValueAndValidity();
    this.accessGroupsInput.nativeElement.value = '';
    this.accessGroupsCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.accessGroupsAvail.filter(accessGroup => accessGroup.toLowerCase().indexOf(filterValue) === 0);
  }

  onFileChanged($event) {
    // For now, just save the file name and show the image. 
    // If the user really decides to add the logbook, the upload of the image will be triggered
    this.uploadThumbnailFile = $event.target.files[0];
    console.log(this.uploadThumbnailFile)
    this.fileId = this.uploadThumbnailFile.name;
    this.createImageFromBlob(this.uploadThumbnailFile);
    this.showThumbnail();
    this.customImageLoaded = true;
  }

  removeThumbnail() {
    this.hideThumbnail();
    this.customImageLoaded = false;
    this.uploadThumbnailFile = null;
  }

  showThumbnail() {
    this.imageLoaded = true;
    this.thumbnailText = 'Change thumbnail';
  }

  hideThumbnail() {
    this.imageLoaded = false;
    this.thumbnailText = 'Add thumbnail';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
