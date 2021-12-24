import { TestBed } from '@angular/core/testing';

import { LogbookInfoService } from './logbook-info.service';
import { ViewsService } from './views.service';
import { of } from 'rxjs';
import { Logbooks } from '@model/logbooks';
import { LogbookDataService } from '@shared/remote-data.service';



describe('LogbookInfoService', () => {
  let service: LogbookInfoService;
  let viewsMock: jasmine.SpyObj<ViewsService>;
  let logbookMock:Logbooks[] = [
    {name: 'LogbookName', description: 'I am the one who knocks.', location: "12345", id: "abc123"}
  ];
  let dataserviceSpy:any;
  let viewsSpy:any;

  beforeEach(() => {
    // dataServiceMock = new DataServiceMock();
    dataserviceSpy = jasmine.createSpyObj("LogbookDataService", ["_getAvailLogbooks", "_getLogbookInfo"]);
    dataserviceSpy._getAvailLogbooks.and.returnValue(logbookMock);

    viewsSpy = jasmine.createSpyObj("ViewsService", ["getLogbookViews"]);


    TestBed.configureTestingModule({
      providers: [
        {provide: LogbookDataService, useValue: dataserviceSpy}, 
        {provide: ViewsService, useValue: viewsSpy}],
    });
    service = TestBed.inject(LogbookInfoService);
  });

  it('should update availLogbooks', ()=>{
    service.availLogbooks = logbookMock;
    expect(service['_availLogbooks']).toEqual(logbookMock);
  })

  it('should return logbook', ()=>{
    expect(service.logbookInfo).toEqual(service['logbook']);
  })

  it('should request logbooks if no logbooks are available', ()=>{
    spyOn(service, 'getAvailLogbooks');

    service.availLogbooks;
    expect(service["_availLogbooks"].length).toEqual(0);
    expect(service.getAvailLogbooks).toHaveBeenCalled();
  })

  it('should update logbook info', ()=>{
    spyOn(service, 'updateViews');

    expect(service["logbook"]).toBeNull();
    expect(service["oldLogbookId"]).toBeNull();

    service.logbookInfo = logbookMock[0];
    expect(service["logbook"].id).toEqual("abc123");
    expect(service['logbook']).toEqual(logbookMock[0]);
    expect(service["logbook"]).not.toBeNull();
    
    expect(service.updateViews).toHaveBeenCalled();
  })

  it('should get available logbooks', ()=>{
    service.getAvailLogbooks();
    expect(service["dataService"]._getAvailLogbooks).toHaveBeenCalled();
  })

  it('should get logbook info', ()=>{
    service.getLogbookInfo("123");
    expect(service["dataService"]._getLogbookInfo).toHaveBeenCalledWith("123");
  })

  it("should update views", ()=>{
    service.updateViews();
    expect(service["views"].getLogbookViews).toHaveBeenCalledWith(service["logbook"]);
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  
});
