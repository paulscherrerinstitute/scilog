import { Basesnippet, BasesnippetRelations } from '../models';
import { MongoDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { AutoAddRepository} from './autoadd.repository.base';

export class BasesnippetRepository extends AutoAddRepository <
  Basesnippet,
  typeof Basesnippet.prototype.id,
  BasesnippetRelations
  > {

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Basesnippet, dataSource);
  }
}
