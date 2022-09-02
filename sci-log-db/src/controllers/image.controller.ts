import {
  FilterExcludingWhere,
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  Response,
  RestBindings,
  HttpErrors,
} from '@loopback/rest';
import { inject } from '@loopback/core';
import { FileRepository } from '../repositories/file.repository';
import { Filesnippet } from '../models/file.model';

const Mongo = require('mongodb');

export class ImageController {
  constructor(
    @repository(FileRepository)
    public fileRepository: FileRepository,
  ) { }

  @get('/images/{id}', {
    responses: {
      '200': {
        description: 'Download file',
      },
    },
  })
  // @oas.response.file()
  async downloadFile(
    @param.path.string('id') id: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    let dataQuery = await this.fileRepository.find({ 'where': { "or": [{ "accessHash": id }, { "id": id }] } }, { openAccess: true })
    if (dataQuery.length > 1) {
      throw new HttpErrors.BadRequest(`Image query result is not unique.`);
    }
    let data = dataQuery[0];
    console.log(data);
    if (typeof data._fileId == 'undefined') {
      throw new HttpErrors.BadRequest(`Retrieving sandbox data is deprecated.`);
    }
    let bucket = new Mongo.GridFSBucket(this.fileRepository.dataSource.connector?.db);
    response.set('Content-Type', data.contentType);
    bucket.openDownloadStream(data._fileId).pipe(response);
    return response;
  }

}
