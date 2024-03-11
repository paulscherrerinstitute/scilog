import {modelToJsonSchema} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {Basesnippet} from '../../models';
import {
  getModelSchemaRefWithDeprecated,
  getModelSchemaRef,
  validateFieldsVSModel,
  defaultSequentially,
  concatOwnerAccessGroups,
  arrayOfUniqueFrom,
  filterEmptySubsnippets,
  standardiseIncludes,
} from '../../utils/misc';

describe('Utils unit tests', function (this: Suite) {
  it('Should filterEmptySubsnippets', () => {
    const snippet = {
      subsnippets: [
        {
          subsnippets: [
            undefined,
            {subsnippets: [1, undefined]},
            {subsnippets: [undefined, undefined]},
            {subsnippets: undefined},
            {subsnippets: []},
          ],
        },
      ],
    } as Basesnippet;
    filterEmptySubsnippets(snippet);
    expect(snippet).to.eql({
      subsnippets: [{subsnippets: [{subsnippets: [1]}]}],
    });
  });

  [
    {
      subsnippets: [
        {
          subsnippets: [
            undefined,
            {subsnippets: [1, undefined]},
            {subsnippets: [undefined, undefined]},
            {subsnippets: undefined},
            {subsnippets: []},
          ],
        },
        undefined,
      ],
    },
    {
      subsnippets: [
        {
          subsnippets: [
            undefined,
            {subsnippets: [1, undefined]},
            {subsnippets: [undefined, undefined]},
            {subsnippets: undefined},
            {subsnippets: []},
          ],
        },
      ],
    },
    {
      subsnippets: [
        {
          subsnippets: [
            {subsnippets: [1, undefined]},
            {subsnippets: [undefined, undefined]},
            {subsnippets: undefined},
            {subsnippets: []},
          ],
        },
      ],
    },
    {
      subsnippets: [{subsnippets: [{subsnippets: [1]}]}],
    },
  ].forEach((t, i) => {
    it(`Should filterEmptySubsnippets with maxDept ${i}`, () => {
      const snippet = {
        subsnippets: [
          {
            subsnippets: [
              undefined,
              {subsnippets: [1, undefined]},
              {subsnippets: [undefined, undefined]},
              {subsnippets: undefined},
              {subsnippets: []},
            ],
          },
          undefined,
        ],
      } as Basesnippet;
      filterEmptySubsnippets(snippet, i);
      expect(snippet).to.eql(t);
    });
  });

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

  it('Should default to the first non undefined or non empty list or non empty object value or last element', () => {
    expect(defaultSequentially(1, 2, 3)).to.be.eql(1);
    expect(defaultSequentially(1, undefined, 3)).to.be.eql(1);
    expect(defaultSequentially(1, 2, undefined)).to.be.eql(1);
    expect(defaultSequentially(1, false, 3)).to.be.eql(1);
    expect(defaultSequentially(1, 2, false)).to.be.eql(1);
    expect(defaultSequentially(1, [], 3)).to.be.eql(1);
    expect(defaultSequentially(1, 2, [])).to.be.eql(1);
    expect(defaultSequentially(1, {}, 3)).to.be.eql(1);
    expect(defaultSequentially(1, 2, {})).to.be.eql(1);
    expect(defaultSequentially({}, 2, {})).to.be.eql(2);
    expect(defaultSequentially([], 2, {})).to.be.eql(2);
    expect(defaultSequentially({}, [], 3)).to.be.eql(3);
    expect(defaultSequentially({}, [], undefined, false, null, 5)).to.be.eql(5);
    expect(defaultSequentially({}, [], undefined, false, [])).to.be.eql([]);
    expect(defaultSequentially({}, [], undefined, false, {})).to.be.eql({});
    expect(defaultSequentially({}, [], undefined, false, undefined)).to.be.eql(
      undefined,
    );
    expect(defaultSequentially({}, [], undefined, false, false)).to.be.eql(
      false,
    );
    expect(defaultSequentially({}, [], undefined, false, null)).to.be.eql(null);
  });

  [
    {
      input: {
        ownerGroup: 'a',
        accessGroups: ['b'],
      },
      expected: {ownerGroup: 'a', accessGroups: ['a', 'b']},
    },
    {
      input: {},
      expected: {},
    },
    {
      input: {readACL: ['a']},
      expected: {readACL: ['a']},
    },
    {
      input: {readACL: ['a'], ownerGroup: 'b'},
      expected: {readACL: ['a'], ownerGroup: 'b'},
    },
    {
      input: {ownerGroup: 'b'},
      expected: 'error',
    },
    {
      input: {accessGroups: ['b']},
      expected: 'error',
    },
  ].forEach((t, i) => {
    it(`Should test concatOwnerAccessGroups ${i}`, () => {
      if (t.expected === 'error')
        try {
          concatOwnerAccessGroups(t.input);
        } catch (err) {
          expect(err.name).to.be.eql('ForbiddenError');
        }
      else {
        concatOwnerAccessGroups(t.input);
        expect(t.input).to.be.eql(t.expected);
      }
    });
  });

  [
    {
      input: ['a', null, 'b', undefined, 'a'],
      expected: ['a', 'b'],
    },
    {
      input: [null, undefined],
      expected: [],
    },
    {
      input: ['a', null, 'b', undefined, 'a', [1], [2], [2]],
      expected: ['a', 'b', 1, 2],
    },
    {
      input: [[1], [2], [2], 'a', null, 'b', undefined, 'a', [2]],
      expected: [1, 2, 'a', 'b'],
    },
  ].forEach((t, i) => {
    it(`Should test arrayOfUniqueFrom ${i}`, () => {
      expect(arrayOfUniqueFrom(...t.input)).to.be.eql(t.expected);
    });
  });

  [
    {
      input: {include: ['a']},
      expected: {include: [{relation: 'a'}]},
    },
    {
      input: {include: [{relation: 'a'}]},
      expected: {include: [{relation: 'a'}]},
    },
    {
      input: {},
      expected: {},
    },
    {
      input: {include: ['a'], where: 'b'},
      expected: {include: [{relation: 'a'}], where: 'b'},
    },
    {
      input: {include: [{relation: 'a', include: ['c']}]},
      expected: {include: [{relation: 'a', include: [{relation: 'c'}]}]},
    },
  ].forEach((t, i) => {
    it(`Should test standardiseIncludes ${i}`, () => {
      standardiseIncludes(t.input);
      expect(t.input).to.be.eql(t.expected);
    });
  });
});
