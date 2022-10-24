import {
  defineModelClass,
  Entity,
  JsonSchema,
  ModelDefinition,
} from '@loopback/repository';
import {JsonSchemaOptions} from '@loopback/repository-json-schema';
import {
  getModelSchemaRef as loobpackGetModelSchemaRef,
  SchemaObject,
} from '@loopback/rest';
import _ from 'lodash';

export function getModelSchemaRefWithDeprecated<T extends Entity>(
  modelCtor: Function & {prototype: T},
  options?: JsonSchemaOptions<T> & {deprecated?: (keyof T)[]},
) {
  const deprecated = options?.deprecated ?? [];
  const title = options?.title ?? modelCtor.name;
  const modelSchemaRef = loobpackGetModelSchemaRef(modelCtor, {
    ..._.omit(options, ['deprecated', 'title']),
    title: title,
  });
  deprecated.map(d => {
    const prop = modelSchemaRef.definitions[title].properties?.[
      d as string
    ] as SchemaObject;
    if (prop) prop.deprecated = true;
  });
  return modelSchemaRef;
}

function getModelSchemaRefWithDeprecatedOwnerGroupAccessGroups<
  T extends Entity
>(
  modelCtor: Function & {prototype: T; definition?: ModelDefinition},
  options?: JsonSchemaOptions<T> & {strict?: boolean},
) {
  const snippetCompatibleSchema = addOwnerGroupAccessGroups<T>(
    modelCtor,
    options?.strict,
  );
  return getModelSchemaRefWithDeprecated(snippetCompatibleSchema, {
    ...options,
    deprecated: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'ownerGroup' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'accessGroups' as any,
    ],
  });
}

export function addOwnerGroupAccessGroups<T extends Entity>(
  modelCtor: Function & {
    prototype: T;
    definition?: ModelDefinition | undefined;
  },
  strict = false,
) {
  const deprecatedGroups = new ModelDefinition({
    name: `${modelCtor.name}GroupsCompatible`,
    settings: {
      ..._.omit(modelCtor.definition?.settings, 'strict'),
      strict: strict ?? modelCtor.definition?.settings?.strict,
    },
    properties: {
      ownerGroup: {
        type: 'string',
        description:
          'ownerGroup field is deprecated. Please create an ACL upfront and reference it through the aclId at snippet creation',
      },
      accessGroups: {
        type: 'array',
        itemType: 'string',
        description:
          'accessGroups field is deprecated. Please create an ACL upfront and reference it through the aclId at snippet creation',
      },
    },
  });

  const snippetCompatibleSchema = defineModelClass(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modelCtor as any,
    deprecatedGroups,
  );
  return snippetCompatibleSchema;
}

export const validateFieldsVSModel = (
  fields: object,
  modelDefinition: JsonSchema,
  callback: Function,
) => {
  const fieldsList = Object.keys(fields);
  const fieldsDifference =
    _.difference(
      fieldsList,
      Object.keys(modelDefinition.properties as object),
    ) ?? [];
  if (fieldsDifference.length > 0) {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const error = new Error('Validation error') as any;
    error.statusCode = 422;
    error.code = 'VALIDATION_FAILED';
    error.details = {
      messages: fieldsDifference.reduce(
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        (o: any, k) => ((o[k as string] = ['is not defined in the model']), o),
        {},
      ),
    };
    callback(error);
    return error;
  }
};

export const getModelSchemaRef = getModelSchemaRefWithDeprecatedOwnerGroupAccessGroups;
export function getModelSchemaRefWithStrict<T extends Entity>(
  modelCtor: Function & {prototype: T; definition?: ModelDefinition},
  options?: JsonSchemaOptions<T> & {strict?: boolean},
) {
  return getModelSchemaRefWithDeprecatedOwnerGroupAccessGroups(modelCtor, {
    ..._.omit(options, 'strict'),
    strict: true,
  });
}
