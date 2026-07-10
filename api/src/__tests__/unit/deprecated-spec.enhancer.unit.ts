import {expect} from '@loopback/testlab';
import {OpenApiSpec, SchemaObject} from '@loopback/rest';
import {DeprecatedSpecEnhancer} from '../../services/deprecated-spec.enhancer';

describe('DeprecatedSpecEnhancer', () => {
  const enhancer = new DeprecatedSpecEnhancer();

  const baseSpec = {
    openapi: '3.0.0',
    info: {title: 'test', version: '1.0'},
    paths: {
      '/old-endpoint': {
        get: {
          deprecated: true,
          responses: {'200': {description: 'OK'}},
        },
      },
    },
    components: {
      schemas: {
        ARef: {$ref: '#/components/schemas/Other'},
        TestModel: {
          properties: {
            // deprecated array — should be hoisted
            deprecatedArray: {
              type: 'array',
              items: {type: 'string', deprecated: true},
            },
            // deprecated: false array — should still be hoisted
            notDeprecatedArray: {
              type: 'array',
              items: {type: 'string', deprecated: false},
            },
            // non-deprecated array — should be untouched
            tags: {
              type: 'array',
              items: {type: 'string'},
            },
            // $ref items — should be untouched
            subsnippets: {
              type: 'array',
              items: {$ref: '#/components/schemas/Other'},
            },
            // non-array deprecated — should be untouched
            ownerGroup: {
              type: 'string',
              deprecated: true,
            },
          },
        },
        OtherModel: {
          properties: {
            anotherList: {
              type: 'array',
              items: {type: 'number', deprecated: true},
            },
          },
        },
      },
    },
  } as OpenApiSpec;

  let props: SchemaObject['properties'];
  let otherProps: SchemaObject['properties'];

  before(() => {
    const result = enhancer.modifySpec(structuredClone(baseSpec));
    props = (result.components?.schemas?.TestModel as SchemaObject).properties;
    otherProps = (result.components?.schemas?.OtherModel as SchemaObject)
      .properties;
  });

  it('should hoist deprecated from items to array property', () => {
    const prop = props!.deprecatedArray as SchemaObject;
    expect(prop.deprecated).to.be.true();
    expect((prop.items as SchemaObject).deprecated).to.be.undefined();
  });

  it('should hoist deprecated: false from items', () => {
    const prop = props!.notDeprecatedArray as SchemaObject;
    expect(prop.deprecated).to.be.false();
    expect((prop.items as SchemaObject).deprecated).to.be.undefined();
  });

  it('should not modify arrays without deprecated items', () => {
    const prop = props!.tags as SchemaObject;
    expect(prop.deprecated).to.be.undefined();
  });

  it('should skip array items that use $ref', () => {
    const prop = props!.subsnippets as SchemaObject;
    expect(prop.deprecated).to.be.undefined();
    expect(prop.items).to.eql({
      $ref: '#/components/schemas/Other',
    });
  });

  it('should not modify non-array deprecated properties', () => {
    const prop = props!.ownerGroup as SchemaObject;
    expect(prop.deprecated).to.be.true();
  });

  it('should skip schemas that are $ref only', () => {
    const result = enhancer.modifySpec(structuredClone(baseSpec));
    expect(result.components?.schemas?.ARef).to.eql({
      $ref: '#/components/schemas/Other',
    });
  });

  it('should process multiple schemas', () => {
    const prop = otherProps!.anotherList as SchemaObject;
    expect(prop.deprecated).to.be.true();
    expect((prop.items as SchemaObject).deprecated).to.be.undefined();
  });

  it('should not affect deprecated endpoints', () => {
    const result = enhancer.modifySpec(structuredClone(baseSpec));
    expect(result.paths['/old-endpoint'].get.deprecated).to.be.true();
  });

  it('should handle spec without schemas', () => {
    const emptySpec = {
      openapi: '3.0.0',
      info: {title: 'test', version: '1.0'},
      paths: {},
    } as OpenApiSpec;

    const result = enhancer.modifySpec(emptySpec);
    expect(result).to.eql(emptySpec);
  });
});
