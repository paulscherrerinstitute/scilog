import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagEditorComponent } from './tag-editor.component';
import { TagService } from '../tag.service';
import { ViewsService } from '@shared/views.service';
import { of } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

describe('TagEditorComponent', () => {
  let component: TagEditorComponent;
  let fixture: ComponentFixture<TagEditorComponent>;
  let tagServiceSpy:any;
  let viewSpy:any;

  tagServiceSpy = jasmine.createSpyObj("TagService", ["getTags", "getLastTags"]);
  tagServiceSpy.getTags.and.returnValue(of({}));
  viewSpy = jasmine.createSpyObj("ViewsService", ["views"]);
  viewSpy.views.and.returnValue([]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagEditorComponent ],
      imports: [MatAutocompleteModule],
      providers: [
        {provide: TagService, useValue: tagServiceSpy},
        {provide: ViewsService, useValue: viewSpy}],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should convert strings to tags', ()=>{
    let tags = component.stringsToTags(['tag1', 'tag2'])
    expect(tags).toEqual([{name:'tag1'}, {name:'tag2'}])
    tags = component.stringsToTags([])
    expect(tags).toEqual([])
  })
});
