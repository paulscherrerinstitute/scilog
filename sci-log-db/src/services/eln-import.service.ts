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
import {ElnTranslator, ImportDraft} from './eln-translator';
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

@injectable({scope: BindingScope.TRANSIENT})
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
   * Validate and import an .eln archive. Phased because paragraph HTML
   * references files by `fileHash` — files must exist (and have their
   * hashes assigned) before paragraphs can be rewritten:
   * 1. Logbook
   * 2. All files — created free-floating (no parentId, matching SciLog's
   *    convention; paragraphs link to them via Filecontainer.fileId)
   * 3. Paragraphs (HTML decoded, Filecontainers built) parented to the
   *    logbook, then each paragraph's comments parented to the paragraph.
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
    const logbookId = await this.createLogbook(draft, location);
    const fileMap = await this.createFiles(draft, parsed.elnArchive);
    await this.createParagraphs(draft, logbookId, fileMap);

    return this.logbookRepository.findById(
      logbookId,
      {include: ['subsnippets']},
      {currentUser: this.user},
    );
  }

  private async createLogbook(
    draft: ImportDraft,
    location: Location,
  ): Promise<string> {
    const created = await this.logbookRepository.create(
      {
        ...draft.logbook.fields,
        location: location.id,
        ownerGroup: this.user.email,
        accessGroups: [this.user.email],
      },
      {currentUser: this.user},
    );
    return created.id;
  }

  private async createFiles(
    draft: ImportDraft,
    archive: ElnArchive,
  ): Promise<Map<string, CreatedFile>> {
    const fileMap = new Map<string, CreatedFile>();
    for (const [elnId, fileDraft] of draft.files) {
      const bytes = archive.getFile(elnId);
      if (!bytes) {
        throw new Error(`ElnImport: file bytes missing for ${elnId}`);
      }
      // accessHash mirrors FileController's format (64-byte hex);
      // fileHash uses UUID to match the per-paragraph reference style.
      const accessHash = crypto.randomBytes(64).toString('hex');
      const filename = fileDraft.fields.filename ?? elnId;
      const fileId = await this.fileStorage.upload(
        Readable.from(bytes),
        filename,
      );
      const created = await this.fileRepository.create(
        {...fileDraft.fields, _fileId: fileId, accessHash},
        {currentUser: this.user},
      );
      fileMap.set(elnId, {
        fileId: created.id,
        fileHash: crypto.randomUUID(),
        accessHash,
        fileExtension: fileDraft.fields.fileExtension ?? '',
      });
    }
    return fileMap;
  }

  private async createParagraphs(
    draft: ImportDraft,
    logbookId: string,
    fileMap: ReadonlyMap<string, CreatedFile>,
  ): Promise<void> {
    for (const paragraphDraft of draft.paragraphs.values()) {
      const filecontainers = paragraphDraft.hasPart.map(elnId =>
        requireFile(elnId, fileMap),
      );
      const html = paragraphDraft.fields.textcontent;
      const decodedHtml = html
        ? ElnTranslator.decodeFileReferences(html, fileMap)
        : html;
      const created = await this.paragraphRepository.create(
        {
          ...paragraphDraft.fields,
          textcontent: decodedHtml,
          files: filecontainers,
          parentId: logbookId,
        },
        {currentUser: this.user},
      );
      for (const commentId of paragraphDraft.comment) {
        const commentDraft = draft.comments.get(commentId);
        if (!commentDraft) {
          throw new Error(
            `ElnImport: paragraph references unknown comment ${commentId}`,
          );
        }
        await this.paragraphRepository.create(
          {...commentDraft.fields, parentId: created.id},
          {currentUser: this.user},
        );
      }
    }
  }
}

function requireFile(
  elnId: string,
  fileMap: ReadonlyMap<string, CreatedFile>,
): CreatedFile {
  const f = fileMap.get(elnId);
  if (!f) {
    throw new Error(`ElnImport: paragraph references unknown file ${elnId}`);
  }
  return f;
}
