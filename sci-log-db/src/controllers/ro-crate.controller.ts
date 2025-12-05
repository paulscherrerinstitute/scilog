import {repository} from '@loopback/repository';
import {get, param, RestBindings, Response} from '@loopback/rest';

import {inject, service} from '@loopback/core';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../services/basic.authorizor';
import {FileRepository} from '../repositories/file.repository';
import {RoCrateService} from '../services';
import {EntityBuilderService} from '../services';
import {ArchiveService, AssetDescriptor} from '../services/archive.service';
import {Readable} from 'stream';

import {ObjectId} from 'mongodb';
import * as mongodb from 'mongodb';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Preview, Defaults, HtmlFile} from 'ro-crate-html/index-node.js';
import path from 'path';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class RoCrateController {
  static readonly ARCHIVE_ROOT = 'scilog-eln-export';
  constructor(
    @repository(FileRepository) private fileRepository: FileRepository,
    @service(RoCrateService) private rocrateService: RoCrateService,
    @service(ArchiveService) private archiveService: ArchiveService,
    @service(EntityBuilderService) private entityBuilder: EntityBuilderService,
  ) {}

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
    const {rocrate} = await this.rocrateService.getRoCrateMetadata(id);
    return rocrate;
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
    const {rocrate, fileMetadata} =
      await this.rocrateService.getRoCrateMetadata(id);

    // Build asset descriptors from GridFS streams for files referenced in snippets
    const bucket = new mongodb.GridFSBucket(
      this.fileRepository.dataSource.connector?.db,
    );
    const assets: Array<AssetDescriptor> = fileMetadata.map(
      ({snippetId, fileId, fileExt}) => {
        return {
          stream: bucket.openDownloadStream(fileId as unknown as ObjectId),
          archivePath: path.join(
            RoCrateController.ARCHIVE_ROOT,
            this.entityBuilder.getFilePath(snippetId, fileId, fileExt),
          ),
        };
      },
    );

    // add metadata json as a stream asset
    const metadataJson = JSON.stringify(rocrate, null, 2);
    assets.push({
      stream: Readable.from([metadataJson]),
      archivePath: path.join(
        RoCrateController.ARCHIVE_ROOT,
        'ro-crate-metadata.json',
      ),
    });

    // generate preview html and add as stream asset
    const previewHtml: string = await new HtmlFile(new Preview(rocrate)).render(
      Defaults.render_script,
    );
    assets.push({
      stream: Readable.from([previewHtml]),
      archivePath: path.join(
        RoCrateController.ARCHIVE_ROOT,
        'ro-crate-preview.html',
      ),
    });

    await this.archiveService.streamZipToResponse(assets, response);
  }
}
