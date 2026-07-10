import { Basesnippets } from './basesnippets';

export interface Filesnippet extends Basesnippets {
  fileExtension?: string;
  accessHash?: string;
}
