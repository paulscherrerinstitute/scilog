import {model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';
import {Filecontainer} from './location.model';

export enum LinkType {
  PARAGRAPH = 'paragraph',
  COMMENT = 'comment',
  QUOTE = 'quote',
}

@model({
  settings: {
    strict: false,
    scope: {
      where: {snippetType: 'paragraph'},
    },
    mongodb: {collection: 'Basesnippet'},
    hiddenProperties: ['htmlTextcontent'],
  },
})
export class Paragraph extends Basesnippet {
  @property({
    type: 'string',
    default: 'paragraph',
  })
  snippetType: string;

  @property({
    type: 'string',
    description: 'HTML content of this paragraph',
  })
  textcontent?: string;

  @property({
    type: 'string',
    description:
      'Plain text of textcontent without HTML tags, set by the API for search. Not safe to insert as HTML.',
    index: true,
  })
  htmlTextcontent?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(LinkType),
    },
    description:
      'Defines if this entry is considered a comment (to be displayed near the parent info) or an entry which refers to previous discussion entries in which case the entry is shown in chronological order and the parent entry is partially duplicated as a quote',
    default: 'paragraph',
  })
  linkType?: LinkType;

  @property({
    type: 'boolean',
    description: 'Defines if this entry is considered a message.',
  })
  isMessage?: boolean;

  @property({
    type: 'number',
    description: 'Importance level of this paragraph, from 1 (lowest) to 5 (highest).',
    jsonSchema: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
    },
  })
  importance?: number;

  @property.array(Object, {
    type: 'object',
    description: 'Information about the embedded files.',
  })
  files?: Filecontainer[];

  constructor(data?: Partial<Paragraph>) {
    super(data);
  }
}

export interface ParagraphRelations {
  // describe navigational properties here
}

export type ParagraphWithRelations = Paragraph & ParagraphRelations;
