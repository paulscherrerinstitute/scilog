import {ROCrate} from 'ro-crate';

// Minimal RO-Crate 1.2 + ELN graph that passes validation.
export function validElnCrate(): ROCrate {
  return new ROCrate(
    {
      '@context': 'https://w3id.org/ro/crate/1.2/context',
      '@graph': [
        {
          '@id': 'ro-crate-metadata.json',
          '@type': 'CreativeWork',
          identifier: 'ro-crate-metadata.json',
          about: {
            '@id': './',
          },
          conformsTo: {
            '@id': 'https://w3id.org/ro/crate/1.2',
          },
          sdPublisher: {
            '@id': 'https://github.com/paulscherrerinstitute/scilog',
          },
        },
        {
          '@id': './',
          '@type': 'Dataset',
          name: 'crate',
          author: {'@id': '#author'},
          hasPart: [{'@id': './book/'}],
        },
        {
          '@id': 'https://github.com/paulscherrerinstitute/scilog',
          '@type': 'Organization',
          name: 'SciLog',
          url: 'https://github.com/paulscherrerinstitute/scilog',
        },
        {'@id': '#author', '@type': 'Person', email: 'a@example.org'},
        {
          '@id': './book/',
          '@type': ['Book', 'Dataset'],
          name: 'book',
          description: 'a book',
          dateCreated: '2026-01-19T00:00:00.000Z',
          author: {'@id': '#author'},
          hasPart: [],
        },
      ],
    },
    {array: true},
  );
}
