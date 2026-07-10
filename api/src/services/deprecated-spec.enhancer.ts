import {injectable} from '@loopback/core';
import {asSpecEnhancer, OASEnhancer, OpenApiSpec} from '@loopback/rest';

/**
 * A spec enhancer that hoists `deprecated: true` from array `items`
 * to the array property level.
 *
 * This works around a known LoopBack 4 bug where `jsonSchema` options
 * on array properties are merged into `items` instead of the property
 * itself. See: https://github.com/loopbackio/loopback-next/issues/4645
 */
@injectable(asSpecEnhancer)
export class DeprecatedSpecEnhancer implements OASEnhancer {
  name = 'deprecated';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const schemas = spec.components?.schemas;
    if (!schemas) return spec;

    for (const schema of Object.values(schemas)) {
      if (!('properties' in schema)) continue;
      const properties = schema.properties ?? {};

      for (const prop of Object.values(properties)) {
        if (!('type' in prop)) continue;
        if (prop.type !== 'array') continue;
        if (!prop.items || !('deprecated' in prop.items)) continue;

        prop.deprecated = prop.items.deprecated;
        delete prop.items.deprecated;
      }
    }

    return spec;
  }
}
