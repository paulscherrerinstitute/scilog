import {BindingScope, inject, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {SecurityBindings, UserProfile} from '@loopback/security';
import crypto from 'node:crypto';
import {unlink} from 'node:fs/promises';
import {Readable} from 'node:stream';
import {Logbook} from '../models';
import {Filecontainer, Location} from '../models/location.model';
import {
  FileRepository,
  LogbookRepository,
  ParagraphRepository,
} from '../repositories';
import {ElnArchive, ElnError} from './eln-archive';
import {
  ElnTranslator,
  FileDraft,
  LogbookDraft,
  ParagraphDraft,
} from './eln-translator';
import {FileStorageService} from './file-storage.service';

export class ElnImportError extends Error {
  constructor(readonly errors: ElnError[]) {
    super(`ELN import failed with ${errors.length} error(s)`);
    this.name = 'ElnImportError';
  }
}

/** Per-file identity captured after creating the Filesnippet. */
type CreatedFile = Required<
  Pick<Filecontainer, 'fileId' | 'fileHash' | 'accessHash' | 'fileExtension'>
>;

@injectable({scope: BindingScope.REQUEST})
export class ElnImportService {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(LogbookRepository) private logbookRepository: LogbookRepository,
    @repository(FileRepository) private fileRepository: FileRepository,
    @repository(ParagraphRepository)
    private paragraphRepository: ParagraphRepository,
    @service(FileStorageService) private fileStorage: FileStorageService,
  ) {}

  /**
   * Validate and import an .eln archive, re-creating the logbook and its
   * paragraph tree (paragraphs, with their comments nested as child
   * paragraphs). Each node's files are created before the node so its HTML
   * can be rewritten to the new file hashes.
   *
   * Validation errors throw `ElnImportError`; extraction errors (GridFS,
   * DB) bubble — there's no rollback in v1, the user can delete a
   * partially-imported logbook.
   */
  async import(filepath: string, location: Location): Promise<Logbook> {
    let parsed;
    try {
      parsed = await ElnArchive.parse(filepath);
    } finally {
      await unlink(filepath).catch(() => {});
    }
    if (!parsed.ok) throw new ElnImportError(parsed.errors);

    const draft = ElnTranslator.toSciLog(parsed.elnArchive.crate);
    const logbookId = await this.createLogbook(
      draft,
      location,
      parsed.elnArchive,
    );

    return this.logbookRepository.findById(
      logbookId,
      {include: ['subsnippets']},
      {currentUser: this.user},
    );
  }

  private async createLogbook(
    draft: LogbookDraft,
    location: Location,
    archive: ElnArchive,
  ): Promise<string> {
    const logbook = await this.logbookRepository.create(
      {
        ...draft.fields,
        location: location.id,
        ownerGroup: this.user.email,
        accessGroups: [this.user.email],
      },
      {currentUser: this.user},
    );
    for (const paragraph of draft.paragraphs) {
      await this.createParagraph(paragraph, logbook.id, archive);
    }
    return logbook.id;
  }

  private async createParagraph(
    draft: ParagraphDraft,
    parentId: string,
    archive: ElnArchive,
  ): Promise<void> {
    const files = await this.createFiles(draft.files, archive);
    const html = draft.fields.textcontent;
    const textcontent = html
      ? ElnTranslator.decodeFileReferences(html, files)
      : html;
    const created = await this.paragraphRepository.create(
      {...draft.fields, textcontent, files: [...files.values()], parentId},
      {currentUser: this.user},
    );
    for (const child of draft.paragraphs) {
      await this.createParagraph(child, created.id, archive);
    }
  }

  /**
   * Upload each file's bytes to GridFS and create its Filesnippet, returning
   * the created files keyed by ELN `@id` — the caller both attaches them as
   * Filecontainers and rewrites HTML references against their hashes.
   */
  private async createFiles(
    drafts: FileDraft[],
    archive: ElnArchive,
  ): Promise<Map<string, CreatedFile>> {
    const byElnId = new Map<string, CreatedFile>();
    for (const file of drafts) {
      const bytes = archive.getFile(file.elnId);
      if (!bytes) {
        throw new Error(`ElnImport: file bytes missing for ${file.elnId}`);
      }
      // accessHash mirrors FileController's format (64-byte hex);
      // fileHash uses UUID to match the per-paragraph reference style.
      const accessHash = crypto.randomBytes(64).toString('hex');
      const filename = file.fields.filename ?? file.elnId;
      const fileId = await this.fileStorage.upload(
        Readable.from(bytes),
        filename,
      );
      const created = await this.fileRepository.create(
        {...file.fields, _fileId: fileId, accessHash},
        {currentUser: this.user},
      );
      byElnId.set(file.elnId, {
        fileId: created.id,
        fileHash: crypto.randomUUID(),
        accessHash,
        fileExtension: file.fields.fileExtension ?? '',
      });
    }
    return byElnId;
  }
}
