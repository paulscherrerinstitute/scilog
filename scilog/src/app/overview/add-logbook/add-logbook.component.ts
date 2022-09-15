import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
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


export function updateACLMemberValidator(groups: string[]): ValidatorFn {
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
  optionsFormGroup: FormGroup;
  imageUrl: string = '';



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
  accessGroupsCtrl = new FormControl();
  updateGroupsCtrl = new FormControl();
  filteredAccessGroups: Observable<string[]>;
  filteredUpdateGroups: Observable<string[]>;
  accessGroupsSelected: string[] = [];
  updateGroupsSelected: string[] = [];
  availableGroups: string[] = [];


  @ViewChild('accessGroupsInput') accessGroupsInput: ElementRef<HTMLInputElement>;
  @ViewChild('updateGroupsInput') updateGroupsInput: ElementRef<HTMLInputElement>;

  @ViewChild('auto') matAutocompleteUpdateGroups: MatAutocomplete;
  @ViewChild('autoComplAccess') matAutocompleteAccessGroups: MatAutocomplete;


  constructor(
    fb: FormBuilder,
    private dialogRef: MatDialogRef<AddLogbookComponent>,
    private logbookItemDataService: LogbookItemDataService,
    private userPreferences: UserPreferencesService,
    private logbookDataService: LogbookDataService,
    @Inject(MAT_DIALOG_DATA) data) {
    this.optionsFormGroup = fb.group({
      hideRequired: new FormControl(false),
      floatLabel: new FormControl('auto'),
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
      location: new FormControl('', Validators.required),
      updateACL: new FormControl(''),
      readACL: new FormControl(''),
      createACL: new FormControl(''),
      isPrivate: new FormControl(false)
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
      this.optionsFormGroup.get('createACL').setValue(this.logbook.createACL);
      this.optionsFormGroup.get('readACL').setValue(this.logbook.readACL);
      this.optionsFormGroup.get('updateACL').setValue(this.logbook.updateACL);
      this.optionsFormGroup.get('isPrivate').setValue(this.logbook.isPrivate);
      this.imageUrl = this.logbook.thumbnail;
      if (this.imageUrl) {
        this.getImageFromService();
      }
      console.log("editing existing logbook");
    }

    this.availableGroups = this.userPreferences.userInfo?.roles;
    this.filteredAccessGroups = this.accessGroupsCtrl.valueChanges.pipe(startWith(null), map((accessGroup: string | null) => accessGroup ? this._filter(accessGroup) : this.availableGroups.slice()));
    this.filteredUpdateGroups = this.updateGroupsCtrl.valueChanges.pipe(startWith(null), map((accessGroup: string | null) => accessGroup ? this._filter(accessGroup) : this.availableGroups.slice()));

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
    let data = await this.logbookItemDataService.getFile(this.imageUrl);
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
      createACL: this.optionsFormGroup.get('createACL').value,
      readACL: this.optionsFormGroup.get('readACL').value,
      updateACL: this.optionsFormGroup.get('updateACL').value,
      isPrivate: this.optionsFormGroup.get('isPrivate').value,
      thumbnail: this.imageUrl,
      description: this.optionsFormGroup.get('description').value
    }

    if (logbookId != null) {
      // update logbook
      await this.logbookDataService.patchLogbook(logbookId, this.logbook);
      this.logbook.id = logbookId;
    } else {
      // create new logbook
      let data = await this.logbookDataService.postLogbook(this.logbook);
      this.logbook.id = data.id;
    }

    // now that we have the id, let's upload the image
    if (this.uploadThumbnailFile != null) {
      // upload selected file
      let formData = new FormData();
      let filenameStorage: string = this.logbook.id + "." + this.uploadThumbnailFile.name.split('.').pop();
      formData.append('file', this.uploadThumbnailFile);
      await this.logbookDataService.uploadLogbookThumbnail(formData);
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
          if (this.selectedLocation?.file) {
            this.imageUrl = this.selectedLocation.file;
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

  addUpdateGroup(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add accessGroup
    if ((value || '').trim()) {
      this.updateGroupsSelected.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.updateGroupsCtrl.setValue(null);
  }

  removeAccessGroup(accessGroup: string): void {
    const index = this.accessGroupsSelected.indexOf(accessGroup);

    if (index >= 0) {
      this.accessGroupsSelected.splice(index, 1);
    }
  }

  removeUpdateACLGroup(updateACL: string): void {
    const index = this.updateGroupsSelected.indexOf(updateACL);

    if (index >= 0) {
      this.updateGroupsSelected.splice(index, 1);
    }
  }

  selectedAccessGroup(event: MatAutocompleteSelectedEvent): void {
    this.accessGroupsSelected.push(event.option.viewValue);
    this.accessGroupsInput.nativeElement.value = '';
    this.accessGroupsCtrl.setValue(null);
  }

  selectedUpdateGroup(event: MatAutocompleteSelectedEvent): void {
    this.updateGroupsSelected.push(event.option.viewValue);
    this.updateGroupsInput.nativeElement.value = '';
    this.updateGroupsCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.availableGroups.filter(accessGroup => accessGroup.toLowerCase().indexOf(filterValue) === 0);
  }

  onFileChanged($event) {
    // For now, just save the file name and show the image. 
    // If the user really decides to add the logbook, the upload of the image will be triggered
    this.uploadThumbnailFile = $event.target.files[0];
    console.log(this.uploadThumbnailFile)
    this.imageUrl = "files/" + this.uploadThumbnailFile.name;
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
