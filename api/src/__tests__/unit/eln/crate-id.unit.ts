import {expect} from '@loopback/testlab';
import {decodeCrateId} from '../../../services/eln/crate-id';

describe('decodeCrateId', () => {
  it('decodes a percent-encoded id', () => {
    expect(decodeCrateId('data/a%20b.txt')).to.equal('data/a b.txt');
  });

  it('leaves an unencoded id unchanged', () => {
    expect(decodeCrateId('./book/file.txt')).to.equal('./book/file.txt');
  });

  it('leaves a malformed percent-encoded id unchanged', () => {
    expect(decodeCrateId('data/100%.txt')).to.equal('data/100%.txt');
  });
});
