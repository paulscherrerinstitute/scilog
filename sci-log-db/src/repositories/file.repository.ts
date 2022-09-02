import {inject} from '@loopback/core';
import { repository } from '@loopback/repository';
import { ACLRepository } from './acl.repository';
import {MongoDataSource} from '../datasources';
import {FileRelations, Filesnippet} from '../models/file.model';
import {AutoAddRepository} from './autoadd.repository.base';

export class FileRepository extends AutoAddRepository<
  Filesnippet,
  typeof Filesnippet.prototype.id,
  FileRelations
  > {

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(ACLRepository)
    public aclRepository: ACLRepository,
  ) {
    super(Filesnippet, dataSource, aclRepository);
  }
}
