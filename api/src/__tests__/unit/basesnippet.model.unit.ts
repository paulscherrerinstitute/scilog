import {expect} from '@loopback/testlab';
import {getModelSchemaRef, validateValueAgainstSchema} from '@loopback/rest';
import {Basesnippet} from '../../models';

describe('Basesnippet model validation', () => {
  const schemaRef = getModelSchemaRef(Basesnippet);
  const basesnippetSchema = schemaRef.definitions.Basesnippet;
  const importanceProp = basesnippetSchema.properties?.importance as Record<
    string,
    unknown
  >;

  it('should define importance schema with integer type and bounds [1, 5]', () => {
    expect(importanceProp).to.be.an.Object();
    expect(importanceProp.type).to.be.eql('integer');
    expect(importanceProp.minimum).to.be.eql(1);
    expect(importanceProp.maximum).to.be.eql(5);
  });

  it('should accept valid importance levels (1 through 5)', async () => {
    for (const val of [1, 2, 3, 4, 5]) {
      const res = await validateValueAgainstSchema(
        {importance: val},
        schemaRef,
        schemaRef.definitions,
      );
      expect(res.importance).to.be.eql(val);
    }
  });

  it('should allow omitted importance (optional field)', async () => {
    const res = await validateValueAgainstSchema(
      {},
      schemaRef,
      schemaRef.definitions,
    );
    expect(res.importance).to.be.undefined();
  });

  it('should reject invalid importance values', async () => {
    const invalidValues = [0, 6, -1, 2.5];
    for (const val of invalidValues) {
      let errorThrown = false;
      try {
        await validateValueAgainstSchema(
          {importance: val},
          schemaRef,
          schemaRef.definitions,
        );
      } catch (err) {
        errorThrown = true;
        expect((err as Error).message).to.match(/importance/i);
      }
      expect(errorThrown).to.be.True();
    }
  });
});
