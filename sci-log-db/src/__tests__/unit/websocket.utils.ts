import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {Basesnippet} from '../../models';
import {matchesFilterSettings} from '../../utils/websocket';

describe('Websocket unit tests', function (this: Suite) {
  [
    {
      input: [{tags: ['a']}, {filter: {}}],
      expected: true,
    },
    {
      input: [{tags: ['a', 'p']}, {filter: {tags: ['b', 'c']}}],
      expected: false,
    },
    {
      input: [{snippetType: 'anotherType'}, {filter: {snippetType: ['aType']}}],
      expected: false,
    },
    {
      input: [{snippetType: 'aType'}, {filter: {snippetType: ['aType']}}],
      expected: true,
    },
    {
      input: [{tags: ['a', 'p']}, {filter: {tags: ['a', 'c']}}],
      expected: true,
    },
    {
      input: [
        {tags: ['a', 'p'], snippetType: 'anotherType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
      ],
      expected: false,
    },
    {
      input: [
        {tags: ['a', 'p'], snippetType: 'aType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
      ],
      expected: true,
    },
    {
      input: [
        {tags: ['b', 'p'], snippetType: 'aType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
      ],
      expected: false,
    },
    {
      input: [
        {tags: ['b', 'p'], snippetType: 'aType'},
        {filter: {snippetType: []}},
      ],
      expected: true,
    },
    {
      input: [{tags: ['b', 'p'], snippetType: 'aType'}, {filter: {tags: []}}],
      expected: true,
    },
    {
      input: [
        {tags: ['b', 'p'], snippetType: 'aType'},
        {filter: {tags: [], snippetType: []}},
      ],
      expected: true,
    },
    {
      input: [
        {tags: [], snippetType: 'aType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
      ],
      expected: false,
    },
    {
      input: [
        {tags: [], snippetType: 'aType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
        {updatedFields: {tags: []}, removedFields: {}},
      ],
      expected: true,
    },
  ].forEach((t, i) => {
    it(`Should test matchesFilterSettings ${i}`, () => {
      expect(
        matchesFilterSettings(
          t.input[0] as Basesnippet,
          t.input[1],
          t.input[2] as {updatedFields: object; removedFields: object},
        ),
      ).to.be.eql(t.expected);
    });
  });
});
