import { TestBed } from "@angular/core/testing";
import { IsAllowedService } from "./is-allowed.service";
import { UserPreferencesService } from "../core/user-preferences.service";

describe('IsAllowedService', () => {
  let service: IsAllowedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IsAllowedService,
        { provide: UserPreferencesService, useValue: {userInfo: {roles: ['roles']}} },
      ],
    });
    service = TestBed.inject(IsAllowedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


[
    {input: '2200-12-12T00:00:00Z', output: ''},
    {input: '2023-12-12T00:00:00Z', output: jasmine.anything()}
  ].forEach((t, i) => {
    it(`should test isNotExpired ${i}`, () => {
      service.snippet = {expiresAt: t.input};
      expect(service.isNotExpired()).toEqual(!t.output? true: false);
      expect(service.tooltips.expired).toEqual(t.output);
      });
  });

  [
    {input: ['roles'], output: []},
    {input: ['someOtherRole'], output: ['someOtherRole', 'admin']}
  ].forEach((t, i) => {
    it(`should test otherEnabledMembers ${i}`, () => {
      service.snippet = {adminACL: t.input};
      expect(service['otherEnabledMembers']('admin')).toEqual(t.output);
    });
  });

  [
    {input: ['roles'], output: undefined},
    {input: ['someOtherRole'], output: "Enabled for members of 'someOtherRole,admin'"}
  ].forEach((t, i) => {
    it(`should test isUserAllowed ${i}`, () => {
      service.snippet = {updateACL: t.input};
      expect(service.isUserAllowed('update')).toEqual(!t.output ? true: false);
      expect(service.tooltips.update).toEqual(t.output);
    });
  });

  [
    {input: [[], []], output: undefined},
    {input: [['someUpdate'], ['someDelete', 'admin']], output: "Enabled for members of 'someUpdate,someDelete,admin'"}
  ].forEach((t, i) => {
    it(`should test isAnyEditAllowed ${i}`, () => {
      spyOn<any>(service, 'otherEnabledMembers').and.returnValues(...t.input);
      expect(service.isAnyEditAllowed()).toEqual(!t.output ? true: false);
      expect(service.tooltips.edit).toEqual(t.output);
    });
  });

  [
    {input: {expired: undefined, check: true}, output: 'Update'},
    {input: {expired: undefined, check: false}, output: 'Update'},
    {input: {expired: '', check: false}, output: 'Update'},
    {input: {expired: '', check: true}, output: 'Update'},
    {input: {expired: 'Expired', check: false}, output: 'Expired'},
    {input: {expired: 'Expired', check: true}, output: 'Expired'},
  ].forEach((t, i) => {
    it(`should test cascadeExpiration ${i}`, () => {
      service.tooltips.expired = t.input.expired;
      spyOn(service, 'isNotExpired').and.returnValue(t.input.check);
      spyOn(service, 'isUserAllowed').and.returnValue(true);
      service.tooltips.update = 'Update';
      expect(service['cascadeExpiration']('update')).toEqual(t.output === 'Expired'? false: true);
      expect(service.tooltips.update).toEqual(t.output);
      service['cascadeExpiration']('update');
    });
  });
  
});
