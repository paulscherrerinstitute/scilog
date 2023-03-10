import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType } from 'angular-gridster2';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { UserPreferencesService } from '@shared/user-preferences.service';
import { Logbooks } from '@model/logbooks';
import { LogbookDataService, LogbookItemDataService } from '@shared/remote-data.service';


export function ownerGroupMemberValidator(groups: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = !groups.includes(control.value);
    return forbidden ? { forbiddenGroup: { value: control.value } } : null;
  };
}


@Component({
  selector: 'app-add-logbook',
  templateUrl: './add-logbook.component.html',
  styleUrls: ['./add-logbook.component.css']
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
  accessGroupsSelected: string[] = [];
  accessGroupsAvail: string[] = [];


  @ViewChild('accessGroupsInput') accessGroupsInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  constructor(
    fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AddLogbookComponent>,
    private logbookItemDataService: LogbookItemDataService,
    private userPreferences: UserPreferencesService,
    private logbookDataService: LogbookDataService,
    @Inject(MAT_DIALOG_DATA) data) {
    this.optionsFormGroup = fb.group({
      hideRequired: new UntypedFormControl(false),
      floatLabel: new UntypedFormControl('auto'),
      title: new UntypedFormControl('', Validators.required),
      description: new UntypedFormControl(''),
      location: new UntypedFormControl('', Validators.required),
      ownerGroup: new UntypedFormControl('', Validators.required),
      accessGroups: new UntypedFormControl(''),
      isPrivate: new UntypedFormControl(false)
    });
    this.logbook = data;
    console.log("inputData: ", data);

  }

  ngOnInit(): void {
    this.getLocations();
    this.setDefaults();
  }

  setDefaults() {
    if (this.logbook) {
      this.optionsFormGroup.get('title').setValue(this.logbook.name);
      this.optionsFormGroup.get('description').setValue(this.logbook.description);
      this.optionsFormGroup.get('location').setValue(this.logbook.location);
      this.optionsFormGroup.get('ownerGroup').setValue(this.logbook.ownerGroup);
      this.optionsFormGroup.get('accessGroups').setValue(this.logbook.accessGroups);
      this.optionsFormGroup.get('isPrivate').setValue(this.logbook.isPrivate);
      this.fileId = this.logbook.thumbnail;
      if (this.fileId) {
        this.getImageFromService();
      }
      console.log("editing existing logbook");
    }

    let roles = [...this.userPreferences.userInfo?.roles];
    let index = roles.indexOf('any-authenticated-user');
    if (index !== -1) {
      roles.splice(index, 1);
    }
    this.accessGroupsAvail = roles;
    this.filteredAccessGroups = this.accessGroupsCtrl.valueChanges.pipe(startWith(null), map((accessGroup: string | null) => accessGroup ? this._filter(accessGroup) : this.accessGroupsAvail.slice()));
    this.filteredOwnerGroups = this.optionsFormGroup.get('ownerGroup').valueChanges.pipe(startWith(null), map((accessGroup: string | null) => accessGroup ? this._filter(accessGroup) : this.accessGroupsAvail.slice()));
    this.optionsFormGroup.get('ownerGroup').setValidators([ownerGroupMemberValidator(this.accessGroupsAvail)]);
    // let ownerGroupIndex = Object.keys(this.data.filters).find(k => this.data.filters[k].name == 'ownerGroup');
    // if (typeof ownerGroupIndex != 'undefined') {
    //   this.optionsFormGroup.get('ownerGroup').setValue(this.data.filters[ownerGroupIndex].value);
    // } 


  }

  async getLocations() {
    let data = await this.logbookDataService.getLocations();
    if (data.length > 0) {
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
      for (const key in this.optionsFormGroup.controls) {
        if (this.optionsFormGroup.get(key).invalid) {
          this.optionsFormGroup.get(key).setErrors({ 'required': true });
        }
      }
      return;
    }


    let logbookId: string = null;
    if ((this.logbook != null) && (this.logbook.id)) {
      logbookId = this.logbook.id;
    }
    this.logbook = {
      name: this.optionsFormGroup.get('title').value,
      location: this.optionsFormGroup.get('location').value,
      ownerGroup: this.optionsFormGroup.get('ownerGroup').value,
      accessGroups: this.accessGroupsSelected,
      isPrivate: this.optionsFormGroup.get('isPrivate').value,
      description: this.optionsFormGroup.get('description').value
    }

    let fileData: { id: string };
    // now that we have the id, let's upload the image
    if (this.uploadThumbnailFile != null) {
      // upload selected file
      let formData = new FormData();
      let filenameStorage: string = this.logbook.id + "." + this.uploadThumbnailFile.name.split('.').pop();
      if (this.logbook.ownerGroup)
        formData.append('fields', JSON.stringify({ accessGroups: [this.logbook.ownerGroup] }))
      formData.append('file', this.uploadThumbnailFile);
      fileData = await this.logbookDataService.uploadLogbookThumbnail(formData);
    }

    this.logbook.thumbnail = fileData?.id ?? this.fileId;

    if (logbookId != null) {
      // update logbook
      await this.logbookDataService.patchLogbook(logbookId, this.logbook);
      this.logbook.id = logbookId;
    } else {
      // create new logbook
      let data = await this.logbookDataService.postLogbook(this.logbook);
      this.logbook.id = data.id;
    }

    this.dialogRef.close(this.logbook);
  }

  selectLocation(id: any) {
    console.log("locationId:", id.value);
    this.availLocations.forEach(loc => {
      if (loc.id == id.value) {
        this.selectedLocation = loc;
        console.log(this.selectedLocation);
        if (!this.customImageLoaded) {
          console.log(this.selectedLocation)
          if (this.selectedLocation?.files[0]) {
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
      this.accessGroupsSelected.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.accessGroupsCtrl.setValue(null);
  }

  removeAccessGroup(accessGroup: string): void {
    const index = this.accessGroupsSelected.indexOf(accessGroup);

    if (index >= 0) {
      this.accessGroupsSelected.splice(index, 1);
    }
  }

  selectedAccessGroup(event: MatAutocompleteSelectedEvent): void {
    this.accessGroupsSelected.push(event.option.viewValue);
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
