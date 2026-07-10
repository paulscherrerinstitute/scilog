import { Basesnippets } from './basesnippets';

export interface Images extends Basesnippets {
  title?: string;
  caption?: string;
  width?: string;
  height?: string;
  url?: string; // should be removed
  className?: string;
  childTag?: string;
  fileId?: string;
}
