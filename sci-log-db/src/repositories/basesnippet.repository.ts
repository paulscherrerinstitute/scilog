import { Basesnippet, BasesnippetRelations } from '../models';
import { MongoDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { AutoAddRepository} from './autoadd.repository.base';
import { ACLRepository } from './acl.repository';
import { repository } from '@loopback/repository';

export class BasesnippetRepository extends AutoAddRepository <
  Basesnippet,
  typeof Basesnippet.prototype.id,
  BasesnippetRelations
  > {

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(ACLRepository)
    public aclRepository: ACLRepository,
  ) {
    super(Basesnippet, dataSource, aclRepository);
  }
}
