import {expect} from '@loopback/testlab';
import type {ROCrate} from 'ro-crate';
import {ElnErrorCode, ElnImportError} from '../../../../services/eln/errors';
import {TranslatorRegistry} from '../../../../services/eln/translators/translator';
import type {Translator} from '../../../../services/eln/translators/translator';

const crate = {} as ROCrate;

function fake(source: string, matches: boolean): Translator {
  return {
    matches: () => matches,
    validate: () => [],
    toSciLog: () => ({fields: {name: source}, paragraphs: []}),
  };
}

describe('TranslatorRegistry.select', () => {
  it('returns the first translator whose matches accepts the crate', () => {
    const first = fake('first', true);
    const second = fake('second', true);
    const registry = new TranslatorRegistry([first, second]);
    expect(registry.select(crate)).to.equal(first);
  });

  it('skips translators that do not match', () => {
    const skipped = fake('skipped', false);
    const hit = fake('hit', true);
    const registry = new TranslatorRegistry([skipped, hit]);
    expect(registry.select(crate)).to.equal(hit);
  });

  it('throws INVALID_PUBLISHER when no translator matches', () => {
    const registry = new TranslatorRegistry([
      fake('a', false),
      fake('b', false),
    ]);

    let error: unknown;
    try {
      registry.select(crate);
    } catch (e) {
      error = e;
    }

    expect(error).to.be.instanceOf(ElnImportError);
    expect((error as ElnImportError).errors).to.containDeep([
      {code: ElnErrorCode.INVALID_PUBLISHER},
    ]);
  });
});
