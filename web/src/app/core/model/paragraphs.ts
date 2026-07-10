import { Basesnippets } from './basesnippets';

export enum LinkType {
  PARAGRAPH = 'paragraph',
  COMMENT = 'comment',
  QUOTE = 'quote',
}

export interface Paragraphs extends Basesnippets {
  textcontent?: string;
  linkType?: LinkType;
  isMessage?: boolean;
}
