import {model, property} from '@loopback/repository';
import {Basesnippet} from './basesnippet.model';
import { Filecontainer } from './location.model';

enum LinkType {
  PARAGRAPH = 'paragraph',
  COMMENT = 'comment',
  QUOTE = 'quote',
}

@model({
  settings: {
    strict: true,
    scope: {
      where: {snippetType: 'paragraph'},
    },
    mongodb: {collection: 'Basesnippet'},
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
    description: 'Markup contents in markdown (MD) syntax of this paragraph'
  })
  textcontent?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(LinkType),
    },
    description:
      'Defines if this entry is considered a comment (to be displayed near the parent info) or an entry which refers to previous discussion entries in which case the entry is shown in chronological order and the parent entry is partially duplicated as a quote',
  })
  linkType?: LinkType;

  @property({
    type: 'boolean',
    description: 'Defines if this entry is considered a message.',
  })
  isMessage?: boolean;

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
