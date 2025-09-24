// Uncomment these imports to begin using these cool features!

import { Filter, repository } from '@loopback/repository';
import { get, param } from '@loopback/rest';

import { inject } from '@loopback/core';
import { ROCrate } from '../../rocrate-js/dist/lib/rocrate';
import { BasesnippetRepository, LogbookRepository } from '../repositories';
import { Basesnippet, Logbook, Paragraph, Task } from '../models';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';

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
    const crate = new ROCrate({}, { link: false });
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

      if (snippet.snippetType === 'task') {
        crate.addEntity({
          '@id': `howtodirection://${snippet.id}`,
          '@type': 'HowToDirection',
          'text': (snippet as Task).content,
        });
        crate.addEntity({
          '@id': `howtostep://${snippet.id}`,
          '@type': 'HowToStep',
          'position': ++this.counter,
          'creativeWorkStatus': (snippet as Task).isDone ? 'finished' : 'unfinished',
          'temporal': (snippet as Task).createdAt.toISOString(),
          'itemListElement': {
            '@id': `howtodirection://${snippet.id}`
          }
        });
        if (!logbookEntry.step) logbookEntry.step = [];
        logbookEntry.step.push({ '@id': `howtostep://${snippet.id}` });
      }
      if (snippet.subsnippets && snippet.subsnippets.length > 0) {
        snippet.subsnippets.forEach(addRecursive);
      }
    }
    baseSnippets.forEach(addRecursive);

    return crate;
  }
}
