import {inject} from '@loopback/core';
import { repository } from '@loopback/repository';
import { ACLRepository } from './acl.repository';
import {MongoDataSource} from '../datasources';
import {Paragraph, ParagraphRelations} from '../models';
import {AutoAddRepository} from './autoadd.repository.base';


export class ParagraphRepository extends AutoAddRepository<
  Paragraph,
  typeof Paragraph.prototype.id,
  ParagraphRelations
  > {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository(ACLRepository)
    public aclRepository: ACLRepository,
  ) {
    super(Paragraph, dataSource, aclRepository);
  }
}
