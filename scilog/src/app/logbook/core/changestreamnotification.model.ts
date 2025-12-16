import { Basesnippets } from '@model/basesnippets';

export interface ChangeStreamNotification extends Basesnippets {
  operationType?: string;
  content?: any;
  [key: string]: any;
}
