import {injectable, BindingScope, service, inject} from '@loopback/core';
import {Basesnippet, Paragraph, Logbook, LinkType} from '../models';
import {EntityBuilderService} from './entity-builder.service';
import {Filter, repository} from '@loopback/repository';
import {
  BasesnippetRepository,
  FileRepository,
  LogbookRepository,
} from '../repositories';
import {Filesnippet} from '../models/file.model';
import {SecurityBindings, UserProfile} from '@loopback/security';

import {RawEntity} from 'ro-crate/lib/types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {ROCrate} from 'ro-crate';

export interface FileMetadata {
  snippetId: string;
  fileId: string;
  fileExt: string;
}

@injectable({scope: BindingScope.TRANSIENT})
export class RoCrateService {
  private crate: ROCrate;
  private fileMetadata: FileMetadata[];
  private logbookEntity: RawEntity;
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(BasesnippetRepository)
    private basesnippetRepository: BasesnippetRepository,
    @repository(LogbookRepository) private logbookRepository: LogbookRepository,
    @repository(FileRepository) private fileRepository: FileRepository,
    @service(EntityBuilderService) private entityBuilder: EntityBuilderService,
  ) {
    this.crate = new ROCrate({});
    this.fileMetadata = [];
  }

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
    await this.prepareRoCrate(logbook, basesnippets);
    return {rocrate: this.crate, fileMetadata: this.fileMetadata};
  }

  private async prepareRoCrate(
    logbook: Logbook,
    basesnippets: Basesnippet[],
  ): Promise<void> {
    this.crate.root.name = logbook.name;
    this.crate.root.description = logbook.description ?? '';
    this.crate.root.license = this.entityBuilder.buildLicenseEntity();
    this.crate.root.datePublished = new Date().toISOString();
    this.crate.metadata.sdPublisher =
      this.entityBuilder.buildOrganizationEntity();
    this.crate.root.hasPart = [];

    const author = this.entityBuilder.buildPerson(logbook.createdBy);
    this.crate.addEntity(author);
    this.crate.root.hasPart.push(
      this.entityBuilder.buildLogbookEntity(logbook, author),
    );
    this.logbookEntity = this.crate.getEntity(
      this.entityBuilder.getEntityId(logbook.id),
    );
    for (const snippet of basesnippets) {
      await this.traverseSnippet(snippet);
    }
  }

  private async traverseSnippet(snippet: Basesnippet) {
    if (snippet.snippetType === 'paragraph') {
      await this.handleParagraph(snippet as Paragraph);
    }

    for (const subsnippet of snippet.subsnippets ?? []) {
      await this.traverseSnippet(subsnippet);
    }
  }

  private async handleParagraph(paragraph: Paragraph) {
    const author = this.entityBuilder.buildPerson(paragraph.createdBy);
    this.crate.addEntity(author);

    if (paragraph.linkType === LinkType.QUOTE) return;
    if (paragraph.linkType === LinkType.PARAGRAPH) {
      this.logbookEntity.hasPart ||= [];
      this.logbookEntity.hasPart.push(
        this.entityBuilder.buildParagraphEntity(paragraph, author),
      );
    } else if (paragraph.linkType === LinkType.COMMENT) {
      const parent = this.crate.getEntity(
        this.entityBuilder.getEntityId(paragraph.parentId!),
      );
      const commentEntity = this.entityBuilder.buildCommentEntity(
        paragraph,
        author,
        parent,
      );
      parent.comment ||= [];
      parent.comment.push(commentEntity);
      this.logbookEntity.hasPart ||= [];
      this.logbookEntity.hasPart.push(commentEntity);
    }

    await this.handleFiles(paragraph);
  }

  private async handleFiles(paragraph: Paragraph) {
    const paragraphEntity = this.crate.getEntity(
      this.entityBuilder.getEntityId(paragraph.id),
    );
    paragraphEntity.hasPart ||= [];
    for (const file of paragraph.files ?? []) {
      const fileObj: Filesnippet = await this.fileRepository.findById(
        file.fileId,
        {},
        {currentUser: this.user},
      );
      paragraphEntity.hasPart.push(
        this.entityBuilder.buildFileEntity(paragraph.id, fileObj),
      );
      paragraph.textcontent = this.entityBuilder.replaceFileReferences(
        paragraph,
        fileObj,
      );

      this.fileMetadata.push({
        snippetId: paragraph.id,
        fileId: fileObj._fileId,
        fileExt: fileObj.fileExtension,
      });
    }
    paragraphEntity.text = paragraph.textcontent;
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
