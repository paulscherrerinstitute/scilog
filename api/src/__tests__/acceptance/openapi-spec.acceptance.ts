import {expect} from '@loopback/testlab';
import {SchemaObject} from '@loopback/rest';
import {SciLogDbApplication} from '../..';
import {setupApplication} from './test-helper';

describe('OpenAPI spec', () => {
  let app: SciLogDbApplication;
  let basesnippetProps: SchemaObject['properties'];

  before('setupApplication', async () => {
    ({app} = await setupApplication());
    const spec = await app.restServer.getApiSpec();
    basesnippetProps = (spec.components?.schemas?.Basesnippet as SchemaObject)
      .properties;
  });

  after(async () => {
    await app.stop();
  });

  it('should mark ownerGroup on Basesnippet as deprecated', () => {
    const prop = basesnippetProps!.ownerGroup as SchemaObject;
    expect(prop.deprecated).to.be.true();
  });

  it('should mark accessGroups on Basesnippet as deprecated at the array level', () => {
    const prop = basesnippetProps!.accessGroups as SchemaObject;
    expect(prop.deprecated).to.be.true();
    expect((prop.items as SchemaObject).deprecated).to.be.undefined();
  });

  it('should not mark non-deprecated properties as deprecated', () => {
    const snippetType = basesnippetProps!.snippetType as SchemaObject;
    expect(snippetType.deprecated).to.be.undefined();

    const readACL = basesnippetProps!.readACL as SchemaObject;
    expect(readACL.deprecated).to.be.undefined();
  });
});
