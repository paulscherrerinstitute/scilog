import {modelToJsonSchema} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {Basesnippet} from '../../models';
import {
  getModelSchemaRefWithDeprecated,
  getModelSchemaRef,
  validateFieldsVSModel,
  defaultSequentially,
} from '../../utils/misc';

describe('Utils unit tests', function (this: Suite) {
  it('Should add deprecated to delete', () => {
    const withDeprecated = getModelSchemaRefWithDeprecated(Basesnippet, {
      deprecated: ['deleted'],
    });
    expect(
      Object.values(withDeprecated.definitions)[0].properties?.deleted,
    ).to.containEql({deprecated: true});
    expect(Basesnippet.definition.properties.deleted).not.to.containEql({
      deprecated: true,
    });
  });

  it('Should create a model and set ownerGroup and accessGroups to deprecated', () => {
    const withDeprecated = getModelSchemaRef(Basesnippet);
    expect(
      Object.values(withDeprecated.definitions)[0].properties?.ownerGroup,
    ).to.containEql({deprecated: true});
    expect(
      Object.values(withDeprecated.definitions)[0].properties?.accessGroups,
    ).to.containEql({deprecated: true});
    expect(Basesnippet.definition.properties.ownerGroup).not.have.keys([
      'ownerGroup',
      'accessGroups',
    ]);
  });

  it('Should check a valid object against a model schema', () => {
    // eslint-disable-next-line no-unused-expressions
    expect(
      validateFieldsVSModel(
        {snippetType: 'aSnippetType'},
        modelToJsonSchema(Basesnippet),
        function (p: object) {
          return p;
        },
      ),
    ).to.be.null;
  });

  it('Should check an invalid object against a model schema', () => {
    const error = validateFieldsVSModel(
      {something: 'something'},
      modelToJsonSchema(Basesnippet),
      function (p: object) {
        return p;
      },
    );
    expect(error.code).to.be.eql('VALIDATION_FAILED');
    expect(error.message).to.be.eql('Validation error');
    expect(error).to.be.instanceOf(Error);
    expect(error.statusCode).to.be.eql(422);
    expect(error.details.messages).to.be.eql({
      something: ['is not defined in the model'],
    });
  });

  it('Should default based on list', () => {
    expect(defaultSequentially(1, 2, 3)).to.be.eql(1);
    expect(defaultSequentially(1, undefined, 3)).to.be.eql(1);
    expect(defaultSequentially(1, undefined, undefined)).to.be.eql(1);
    expect(defaultSequentially(1, false, undefined)).to.be.eql(1);
    expect(defaultSequentially(undefined, 2, undefined)).to.be.eql(2);
    expect(defaultSequentially(undefined, 2, 3)).to.be.eql(2);
    expect(defaultSequentially(undefined, undefined, 3)).to.be.eql(3);
    expect(defaultSequentially(undefined, false, 3)).to.be.eql(3);
    expect(defaultSequentially(false, undefined, 3)).to.be.eql(3);
    expect(defaultSequentially(false, '', 3)).to.be.eql(3);
  });
});
