import {
  defineModelClass,
  Entity,
  JsonSchema,
  ModelDefinition,
  Filter,
  Where,
} from '@loopback/repository';
import {JsonSchemaOptions} from '@loopback/repository-json-schema';
import {
  HttpErrors,
  getModelSchemaRef as loobpackGetModelSchemaRef,
  SchemaObject,
} from '@loopback/rest';
import _ from 'lodash';
import {Basesnippet} from '../models';
import {JSDOM} from 'jsdom';

export function getModelSchemaRefWithDeprecated<T extends Entity>(
  modelCtor: Function & {prototype: T},
  options?: JsonSchemaOptions<T> & {deprecated?: (keyof T)[]},
) {
  const deprecated = options?.deprecated ?? [];
  const stringOptions = JSON.stringify(options).replace(/[^a-zA-Z0-9 ]/g, '');
  const title = `${options?.title ?? modelCtor.name}${stringOptions}`;
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
  T extends Entity,
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

export const getModelSchemaRef =
  getModelSchemaRefWithDeprecatedOwnerGroupAccessGroups;
export function getModelSchemaRefWithStrict<T extends Entity>(
  modelCtor: Function & {prototype: T; definition?: ModelDefinition},
  options?: JsonSchemaOptions<T> & {strict?: boolean},
) {
  return getModelSchemaRefWithDeprecatedOwnerGroupAccessGroups(modelCtor, {
    ..._.omit(options, 'strict'),
    strict: true,
  });
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function defaultSequentially(...args: any[]) {
  return args.reduce((previousValue, currentValue) => {
    if (
      previousValue != null &&
      (typeof previousValue === 'object' || Array.isArray(previousValue))
    )
      if (Object.keys(previousValue).length > 0) return previousValue;
      else return currentValue;
    else if (previousValue) return previousValue;
    else return currentValue;
  }, undefined);
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function setFrom(...args: any[]) {
  return args.reduce(
    (previousValue, currentValue) => (
      (Array.isArray(currentValue)
        ? currentValue
        : [].concat(currentValue ?? [])
      ).forEach(v => previousValue.add(v)),
      previousValue
    ),
    new Set(),
  );
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function arrayOfUniqueFrom(...args: any[]) {
  return [...setFrom(...args)];
}

export function concatOwnerAccessGroups(data: {
  ownerGroup?: string;
  accessGroups?: string[];
  readACL?: string[];
}) {
  const groups: Partial<keyof typeof data>[] = ['ownerGroup', 'accessGroups'];
  if (!data.readACL && groups.some(g => data[g])) {
    if (!groups.every(g => data[g]))
      throw new HttpErrors.Forbidden(
        'Cannot modify data snippet. Please provide both ownerGroup and accessGroup',
      );
    data.accessGroups = arrayOfUniqueFrom(data.ownerGroup, data.accessGroups);
  }
}

export function filterEmptySubsnippets(
  snippet: Basesnippet,
  maxDepth: number | undefined = undefined,
  level = 0,
  parent?: Basesnippet,
) {
  if (
    !Object.keys(snippet).includes('subsnippets') ||
    (maxDepth !== undefined && level >= maxDepth)
  )
    return;
  snippet.subsnippets = snippet?.subsnippets?.filter(sub => sub);
  if (
    (!snippet.subsnippets || snippet?.subsnippets?.length === 0) &&
    parent?.subsnippets
  ) {
    const subsnippetIndex = parent.subsnippets.findIndex(
      sub => sub.id === snippet.id,
    );
    if (subsnippetIndex >= 0)
      parent.subsnippets[subsnippetIndex] = undefined as unknown as Basesnippet;
    filterEmptySubsnippets(parent as Basesnippet, maxDepth, level - 1);
  } else
    snippet?.subsnippets?.map(sub =>
      filterEmptySubsnippets(sub, maxDepth, level + 1, snippet),
    );
}

export function standardiseIncludes(filter: Pick<Filter, 'include'>) {
  const include = filter?.include;
  if (!include) return;
  include.map((relation, i) => {
    if (typeof relation === 'string') include[i] = {relation: relation};
    else standardiseIncludes(relation as Pick<Filter, 'include'>);
  });
}

export function sanitizeTextContent(textcontent: string) {
  const dom = new JSDOM('<!DOCTYPE html>');
  const div = dom.window.document.createElement('div');
  div.innerHTML = textcontent;
  return div.textContent ?? undefined;
}

export function sanitizeTextContentInPlace(data?: {
  textcontent?: string;
  htmlTextcontent?: string;
}) {
  if (typeof data?.textcontent !== 'string') return;
  const sanitisedText = sanitizeTextContent(data.textcontent);
  if (!sanitisedText) return;
  data.htmlTextcontent = sanitisedText;
}

export function removeDeepBy<M extends object>(
  where: Where<M>,
  condition: Function,
) {
  if (!where || typeof where !== 'object') return;
  const isObject = _.isPlainObject(where);
  Object.entries(where).map(([key, value]) => {
    if (condition(key) && isObject) delete where[key as keyof Where<M>];
    else removeDeepBy(value as Where<M>, condition);
  });
}
