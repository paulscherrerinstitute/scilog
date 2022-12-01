import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {Profile} from 'passport';
import {roles} from '../../authentication-strategies/roles';
import {} from '../../utils/misc';

describe('Authentication strategies roles', function (this: Suite) {
  it('Should return an empty list', () => {
    const emptyRoles = roles({} as Profile);
    expect(emptyRoles).to.be.eql([]);
  });

  it('Should return an empty list since json is undefined', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({...profile, _json: undefined});
    expect(emptyRoles).to.be.eql([]);
  });

  it('Should return an empty list since roles is undefined', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({...profile, _json: {roles: undefined}});
    expect(emptyRoles).to.be.eql([]);
  });

  it('Should return the list of roles', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910']},
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910']);
  });

  it('Should return the list of roles including the p-group from e group', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910', 'e98765']},
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910', 'e98765', 'p98765']);
  });

  it('Should return the list of roles not including the p-group from e group as smaller than 5 digits', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910', 'e9876']},
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910', 'e9876']);
  });

  it('Should return the list of roles not including the p-group from e group as not made of digits only', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910', 'e987a']},
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910', 'e987a']);
  });

  it('Should return the list of roles not including the p-group from e group as longer than 5 digits', () => {
    const profile = {} as Profile;
    const emptyRoles = roles({
      ...profile,
      _json: {roles: ['g12345', 'g78910', 'e987654']},
    });
    expect(emptyRoles).to.be.eql(['g12345', 'g78910', 'e987654']);
  });
});
