import {Filter, repository} from '@loopback/repository';
import {get, param, RestBindings, Response} from '@loopback/rest';

import {generateUniqueId, inject} from '@loopback/core';
import {ROCrate} from '../../rocrate-js/dist/lib/rocrate';
import {BasesnippetRepository, LogbookRepository} from '../repositories';
import {Basesnippet, Filecontainer, Logbook, Paragraph} from '../models';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
import os from 'os';
import {FileRepository} from '../repositories/file.repository';
import {Filesnippet} from '../models/file.model';

import {ObjectId} from 'mongodb';
import * as mongodb from 'mongodb';
// @ts-ignore
import {Preview, Defaults} from 'ro-crate-html';
const HtmlFile = require('ro-crate-html/lib/ro-crate-preview-file.js');

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class RocrateController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(BasesnippetRepository)
    private baseSnippetRepository: BasesnippetRepository,
    @repository(LogbookRepository) private logbookRepository: LogbookRepository,
    @repository(FileRepository) private fileRepository: FileRepository,
  ) {}
  counter = 0;
  getFilter(id: string): Filter<Basesnippet> {
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

  // GET /rocrates/{id}
  @get('/rocrates/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Rocrate model instance',
        content: {'application/json': {schema: {type: 'object'}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<object> {
    return this.prepareRoCrate(id);
  }

  async prepareRoCrate(
    id: string,
    tmpDir: string | undefined = undefined,
    archive: archiver.Archiver | undefined = undefined,
  ): Promise<object> {
    const logbook: Logbook = await this.logbookRepository.findById(
      id,
      {},
      {currentUser: this.user},
    );
    const baseSnippets: Basesnippet[] = await this.baseSnippetRepository.find(
      this.getFilter(id),
      {currentUser: this.user},
    );
    const crate = new ROCrate({});
    crate.root.name = logbook.name;
    crate.root.description = logbook.description ?? '';
    crate.root.hasPart = [];
    crate.root["@type"] = ['Book', 'Dataset'];
    crate.root.dateCreated = logbook.createdAt.toISOString()
    let person = {
      '@id': `person://${logbook.createdBy}`,
      '@type': 'Person',
    };
    crate.addEntity(person);
    crate.root.author = person;
    const addRecursive = async (snippet: Basesnippet) => {
      person = {
        '@id': `person://${snippet.createdBy}`,
        '@type': 'Person',
      };
      crate.addEntity(person);
      const processAndGetFileEntity = async (
        file: Filecontainer,
        archive?: archiver.Archiver,
        tmpDir?: string,
      ): Promise<Record<string, unknown>> => {
        const fileObj: Filesnippet = await this.fileRepository.findById(
          file.fileId,
          {},
          {currentUser: this.user},
        );
        console.log('found fileObj for file', fileObj, file);
        if (archive && tmpDir) {
          const bucket = new mongodb.GridFSBucket(
            this.fileRepository.dataSource.connector?.db,
          );
          if (!fs.existsSync(`${tmpDir}/${snippet.id}`)) fs.mkdirSync(`${tmpDir}/${snippet.id}`);
          const pipedStream = bucket
            .openDownloadStream(fileObj._fileId as unknown as ObjectId)
            .pipe(
              fs.createWriteStream(
                `${tmpDir}/${snippet.id}/${fileObj._fileId}.${fileObj.fileExtension}`,
              ),
            );
          await new Promise<void>((resolve, reject) => {
            pipedStream.on('close', () => {
              this.addToZip(
                archive,
                tmpDir,
                `${snippet.id}/${fileObj._fileId}.${fileObj.fileExtension}`,
              );
              console.log(`${archive.pointer()} total bytes written`);
              resolve();
            });
          });
        }
        return {
          '@id': `./${snippet.id}/${fileObj._fileId}.${fileObj.fileExtension}`,
          '@type': 'File',
          name: fileObj.name,
          encodingFormat: fileObj.contentType,
        };
      };
      if (snippet.snippetType === 'paragraph') {
        let paragraph: Record<string, unknown> = {
          text: (snippet as Paragraph).textcontent ?? '',
          dateCreated: snippet.createdAt.toISOString(),
          keywords: snippet.tags ? snippet.tags.join(',') : '',
          encodingFormat: 'text/html',
          author: person,
        };
        if (
          (snippet as Paragraph).files &&
          (snippet as Paragraph).files!.length > 0
        ) {
          // wait for all file processing (downloads + adding to archive) to finish
          paragraph.hasPart = await Promise.all(
            (snippet as Paragraph).files!.map(x =>
              processAndGetFileEntity(x, archive, tmpDir),
            ),
          );
        }
        if ((snippet as Paragraph).linkType === 'paragraph') {
          paragraph = {
            '@id': `./${snippet.id}`,
            '@type': ['Message', 'Dataset'],
            name: `Paragraph ${snippet.id}`,
            ...paragraph,
          };
          crate.root.hasPart.push(paragraph);
        }
        if ((snippet as Paragraph).linkType === 'comment') {
          const parentParagraph = crate.getEntity(
            `./${snippet.parentId}`,
          );
          paragraph = {
            '@id': `./${snippet.id}`,
            '@type': ['Comment', 'Dataset'],
            name: `Comment ${snippet.id}`,
            parentItem: parentParagraph,
            ...paragraph,
          };
          if (!parentParagraph.comment) parentParagraph.comment = [];
          parentParagraph.comment.push(paragraph);
        }
      }

      // if (snippet.snippetType === 'task') {
      //   crate.addEntity({
      //     '@id': `howtodirection://${snippet.id}`,
      //     '@type': 'HowToDirection',
      //     'text': (snippet as Task).content,
      //   });
      //   crate.addEntity({
      //     '@id': `howtostep://${snippet.id}`,
      //     '@type': 'HowToStep',
      //     'position': ++this.counter,
      //     'creativeWorkStatus': (snippet as Task).isDone ? 'finished' : 'unfinished',
      //     'temporal': (snippet as Task).createdAt.toISOString(),
      //     'itemListElement': {
      //       '@id': `howtodirection://${snippet.id}`
      //     }
      //   });
      //   if (!logbookEntry.step) logbookEntry.step = [];
      //   logbookEntry.step.push({ '@id': `howtostep://${snippet.id}` });
      // }
      if (snippet.subsnippets && snippet.subsnippets.length > 0) {
        for (const ss of snippet.subsnippets) {
          await addRecursive(ss);
        }
      }
    };
    for (const bs of baseSnippets) {
      await addRecursive(bs);
    }

    return crate;
  }

  // GET /rocrates/{id}/download
  @get('/rocrates/{id}/download', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Rocrate model instance',
        content: {'application/zip': {schema: {type: 'object'}}},
      },
    },
  })
  async downloadById(
    @param.path.string('id') id: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    // create a temporary working directory
    const tmpDir = path.join(os.tmpdir(), `rocrate-${generateUniqueId()}`);
    fs.mkdirSync(tmpDir, {recursive: true});
    const [output, archive] = this.initArchive(tmpDir);
    const crate = await this.prepareRoCrate(id, tmpDir, archive);
    fs.writeFileSync(
      `${tmpDir}/ro-crate-metadata.json`,
      JSON.stringify(crate, null, 2),
    );
    this.addToZip(archive, tmpDir, 'ro-crate-metadata.json');
    const x = await new HtmlFile(new Preview(crate)).render(
      Defaults.render_script,
    );
    fs.writeFileSync(`${tmpDir}/ro-crate-preview.html`, x);
    this.addToZip(archive, tmpDir, 'ro-crate-preview.html');
    await this.closeArchive(output, archive);
    response.download(path.join(tmpDir, 'testeln.eln'), err => {
      if (err) {
        console.error('Error sending file:', err);
        response.status(500).send('Error sending file');
      } else {
        // Clean up the temporary directory after sending the file
        fs.rmSync(tmpDir, {recursive: true, force: true});
      }
    });
    return response;
  }

  private addToZip(
    archive: archiver.Archiver,
    tmpDir: string,
    filePath: string,
  ) {
    const archiveName = 'testeln';
    archive.file(`${tmpDir}/${filePath}`, {
      name: `${archiveName}/${filePath}`,
    });
  }

  private initArchive(tmpDir: string): [fs.WriteStream, archiver.Archiver] {
    const output = fs.createWriteStream(`${tmpDir}/testeln.eln`);
    const archive = archiver('zip');

    archive.pipe(output);
    return [output, archive];
  }

  private async closeArchive(
    output: fs.WriteStream,
    archive: archiver.Archiver,
  ) {
    await new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        console.log(`${archive.pointer()} total bytes written`);
        resolve();
      });
      archive.on('error', err => reject(err));
      archive.finalize().catch(err => reject(err));
    });
    console.log('Wrote testeln.eln');
  }
}
