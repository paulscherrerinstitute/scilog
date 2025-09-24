// Uncomment these imports to begin using these cool features!

import { Filter, repository } from '@loopback/repository';
import { get, param, RestBindings, Response } from '@loopback/rest';

import { generateUniqueId, inject } from '@loopback/core';
import { ROCrate } from '../../rocrate-js/dist/lib/rocrate';
import { BasesnippetRepository, LogbookRepository } from '../repositories';
import { Basesnippet, Logbook, Paragraph } from '../models';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';
import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
import os from 'os';


@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class RocrateController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(BasesnippetRepository) private baseSnippetRepository: BasesnippetRepository,
    @repository(LogbookRepository) private logbookRepository: LogbookRepository,
  ) { }
  counter = 0;
  getFilter(id: string): Filter<Basesnippet> {
    return {
      where: {
        and: [
          { snippetType: { inq: ['paragraph', 'image', 'task'] } },
          { deleted: false },
          { parentId: { inq: [id] } },
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
        content: { 'application/json': { schema: { type: 'object' } } },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<object> {
    const logbook: Logbook = await this.logbookRepository.findById(id, {}, { currentUser: this.user });
    const baseSnippets = await this.baseSnippetRepository.find(this.getFilter(id), { currentUser: this.user });
    const crate = new ROCrate({});
    const rootDataset = crate.root;
    rootDataset.name = logbook.name;
    rootDataset.description = logbook.description ?? '';
    crate.root.hasPart = [];
    let person = {
      '@id': `person://${logbook.createdBy}`,
      '@type': 'Person',
    };
    crate.addEntity(person);
    crate.root.hasPart.push({
      '@id': `logbook://${logbook.id}`,
      '@type': 'Dataset',
      'genre': 'experiment',
      'name': `test scilog export: ${logbook.name}`,
      'description': logbook.description ?? '',
      'dateCreated': logbook.createdAt.toISOString(),
      'author': person,
      'mentions': [],
    });
    const logbookEntry = crate.getEntity(`logbook://${logbook.id}`);
    const addRecursive = (snippet: Basesnippet) => {
      person = {
        '@id': `person://${snippet.createdBy}`,
        '@type': 'Person',
      };
      crate.addEntity(person);
      if (snippet.snippetType === 'paragraph' && (snippet as Paragraph).linkType === 'paragraph') {
        crate.root.hasPart.push({
          '@id': `paragraph://${snippet.id}`,
          '@type': 'Dataset',
          'name': `Paragraph ${snippet.id}`,
          text: (snippet as Paragraph).textcontent ?? '',
          genre: 'experiment',
          dateCreated: snippet.createdAt.toISOString(),
          keywords: snippet.tags ? snippet.tags.join(',') : '',
          encodingFormat: 'text/html',
          author: person,
        });
        logbookEntry.mentions.push({ '@id': `paragraph://${snippet.id}` });
      }
      if (snippet.snippetType === 'paragraph' && (snippet as Paragraph).linkType === 'comment') {
        crate.addEntity({
          '@id': `comment://${snippet.id}`,
          '@type': 'Comment',
          'text': (snippet as Paragraph).htmlTextcontent ?? '',
          'dateCreated': snippet.createdAt.toISOString(),
          'author': person,
          // 'about': { '@id': `paragraph://${snippet.parentId}` },
        });
        const paragraphEntity = crate.getEntity(`paragraph://${snippet.parentId}`);
        if (!paragraphEntity.comment) paragraphEntity.comment = [];
        paragraphEntity.comment.push({ '@id': `comment://${snippet.id}` });
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
        snippet.subsnippets.forEach(addRecursive);
      }
    }
    baseSnippets.forEach(addRecursive);

    return crate;
  }

  // GET /rocrates/{id}/download
  @get('/rocrates/{id}/download', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Rocrate model instance',
        content: { 'application/zip': { schema: { type: 'object' } } },
      },
    }
  })
  async downloadById(@param.path.string('id') id: string, @inject(RestBindings.Http.RESPONSE) response: Response) {
    const crate = await this.findById(id);
    // create a temporary working directory
    const tempDir = path.join(os.tmpdir(), `rocrate-${generateUniqueId()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    await this.createZip(crate, tempDir);
    response.download(path.join(tempDir, 'testeln.eln'), (err) => {
      if (err) {
        console.error('Error sending file:', err);
        response.status(500).send('Error sending file');
      } else {
        // Clean up the temporary directory after sending the file
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
    return response;
  }

  private async createZip(crate: object, tmpPath: string): Promise<void> {
    // write metadata file
    fs.writeFileSync(`${tmpPath}/ro-crate-metadata.json`, JSON.stringify(crate, null, 2));

    const output = fs.createWriteStream(`${tmpPath}/testeln.eln`);
    const archive = archiver('zip');

    archive.pipe(output);

    const archiveName = 'testeln';
    archive.file(`${tmpPath}/ro-crate-metadata.json`, { name: `${archiveName}/ro-crate-metadata.json` });

    await new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
        console.log('Archive finalized and file written.');
        resolve();
      });
      archive.on('error', err => reject(err));
      archive.finalize().catch(err => reject(err));
    });
    console.log('Wrote testeln.eln');
  }
}
