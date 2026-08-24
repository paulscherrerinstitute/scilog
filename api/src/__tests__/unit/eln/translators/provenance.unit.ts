import {expect} from '@loopback/testlab';
import {
  provenanceTags,
  sourceTag,
} from '../../../../services/eln/translators/provenance';

describe('sourceTag', () => {
  it('formats the source into an eln:source tag', () => {
    expect(sourceTag('scilog')).to.equal('eln:source:scilog');
  });
});

describe('provenanceTags', () => {
  it('always emits the id tag', () => {
    expect(provenanceTags({id: './book/'})).to.deepEqual(['eln:id:./book/']);
  });

  it('emits author and created tags when present', () => {
    expect(
      provenanceTags({
        id: './book/',
        author: 'a@example.org',
        created: new Date('2026-01-19T00:00:00.000Z'),
      }),
    ).to.deepEqual([
      'eln:id:./book/',
      'eln:author:a@example.org',
      'eln:created:2026-01-19',
    ]);
  });

  it('tags created as its UTC calendar date', () => {
    expect(
      provenanceTags({id: 'x', created: new Date('2026-01-19T13:45:00.000Z')}),
    ).to.containEql('eln:created:2026-01-19');
  });

  it('drops the created tag when the date is invalid', () => {
    expect(
      provenanceTags({id: 'x', created: new Date('not-a-date')}),
    ).to.deepEqual(['eln:id:x']);
  });

  it('omits author when it is undefined or empty', () => {
    expect(provenanceTags({id: 'x', author: ''})).to.deepEqual(['eln:id:x']);
  });
});
