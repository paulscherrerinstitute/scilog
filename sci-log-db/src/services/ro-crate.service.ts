import {injectable, BindingScope, service, inject} from '@loopback/core';
import {Basesnippet, Paragraph, Logbook} from '../models';
import {EntityBuilderService} from './entity-builder.service';
import {Filter, repository} from '@loopback/repository';
import {BasesnippetRepository, LogbookRepository} from '../repositories';
import {FileRepository} from '../repositories/file.repository';
import {Filesnippet} from '../models/file.model';
import {SecurityBindings, UserProfile} from '@loopback/security';

import {RawEntity} from 'ro-crate/lib/types';
// @ts-ignore
import { ROCrate } from 'ro-crate';


export interface FileMetadata {
  snippetId: string;
  fileId: string;
  fileExt: string;
}

@injectable({scope: BindingScope.TRANSIENT})
export class RoCrateService {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(BasesnippetRepository)
    private basesnippetRepository: BasesnippetRepository,
    @repository(LogbookRepository) private logbookRepository: LogbookRepository,
    @repository(FileRepository) private fileRepository: FileRepository,
    @service(EntityBuilderService) private entityBuilder: EntityBuilderService,
  ) {}

  public async getRoCrateMetadata(
    logbookId: string,
  ): Promise<{rocrate: ROCrate; fileMetadata: FileMetadata[]}> {
    const logbook: Logbook = await this.logbookRepository.findById(
      logbookId,
      {},
      {currentUser: this.user},
    );
    const basesnippets: Basesnippet[] = await this.basesnippetRepository.find(
      this.getFilter(logbookId),
      {currentUser: this.user},
    );
    return await this.prepareRoCrate(logbook, basesnippets);
  }

  private async prepareRoCrate(
    logbook: Logbook,
    basesnippets: Basesnippet[],
  ): Promise<{rocrate: ROCrate; fileMetadata: FileMetadata[]}> {
    const crate = new ROCrate({});
    crate.root.name = logbook.name;
    crate.root.description = logbook.description ?? '';
    crate.root.hasPart = [];

    const author = this.entityBuilder.buildPerson(logbook.createdBy);
    crate.addEntity(author);
    crate.root.hasPart.push(this.entityBuilder.buildLogbookEntity(logbook, author));
    const logbookEntity = crate.getEntity(this.entityBuilder.getEntityId(logbook.id));
    const fileMetadata: FileMetadata[] = [];

    for (const snippet of basesnippets) {
      await this.traverseSnippet(snippet, crate, logbookEntity, fileMetadata);
    }

    return {rocrate: crate, fileMetadata};
  }

  private async traverseSnippet(
    snippet: Basesnippet,
    crate: ROCrate,
    logbookEntity: RawEntity,
    fileMetadata: FileMetadata[],
  ) {
    const author = this.entityBuilder.buildPerson(snippet.createdBy);
    crate.addEntity(author);

    if (snippet.snippetType == 'paragraph') {
      const paragraph = snippet as Paragraph;
      if (paragraph.linkType === 'paragraph') {
        const paragraphEntity = this.entityBuilder.buildParagraphEntity(
          paragraph,
          author,
        );
        logbookEntity.hasPart.push(paragraphEntity);
      }

      if (paragraph.linkType === 'comment') {
        const parentParagraph = crate.getEntity(
          this.entityBuilder.getEntityId(paragraph.parentId!),
        );
        const commentEntity = this.entityBuilder.buildCommentEntity(
          paragraph,
          author,
          parentParagraph,
        );
        if (!parentParagraph.comment) parentParagraph.comment = [];
        parentParagraph.comment.push(commentEntity);
      }

      // files
      for (const file of paragraph.files || []) {
        const fileObj: Filesnippet = await this.fileRepository.findById(
          file.fileId,
          {},
          {currentUser: this.user},
        );
        const paragraphEntity = crate.getEntity(
          this.entityBuilder.getEntityId(paragraph.id),
        );
        if (!paragraphEntity.hasPart) paragraphEntity.hasPart = [];
        paragraphEntity.hasPart.push(
          this.entityBuilder.buildFileEntity(paragraph.id, fileObj),
        );
        fileMetadata.push({
          snippetId: paragraph.id,
          fileId: fileObj._fileId,
          fileExt: fileObj.fileExtension,
        });
      }
    }

    for (const subsnippet of snippet.subsnippets || []) {
      await this.traverseSnippet(subsnippet, crate, logbookEntity, fileMetadata);
    }
  }

  private getFilter(id: string): Filter<Basesnippet> {
    return {
      where: {
        and: [
          {snippetType: {inq: ['paragraph']}},
          {deleted: false},
          {parentId: id},
        ],
      },
      include: [
        {
          relation: 'subsnippets',
        },
      ],
      order: ['defaultOrder ASC'],
    };
  }
}
