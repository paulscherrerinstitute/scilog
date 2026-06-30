import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  Response,
  RestBindings,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {errors as formidableErrors, formidable} from 'formidable';
import {Logbook} from '../models';
import {LocationRepository} from '../repositories';
import {basicAuthorization} from '../services/basic.authorizor';
import {ElnError} from '../services/eln-archive';
import {ElnImportError, ElnImportService} from '../services/eln-import.service';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {MAX_FILE_SIZE} from './eln-import.config';
import {
  ELN_IMPORT_REQUEST_BODY,
  ELN_IMPORT_RESPONSES,
} from './specs/eln-import.specs';

/**
 * 422 envelope for archive-validation failures. `details` carries the list
 * of `ElnError`s; strong-error-handler serializes it as `error.details`
 * (one of its default-passthrough fields for 4xx responses).
 */
class ElnImportHttpError extends HttpErrors.UnprocessableEntity {
  constructor(public readonly details: ElnError[]) {
    super('Archive validation failed');
  }
}

const FORMIDABLE_422_ERRORS = new Set([
  formidableErrors.maxFilesExceeded,
  formidableErrors.malformedMultipart,
  formidableErrors.missingMultipartBoundary,
  formidableErrors.missingContentType,
  formidableErrors.noEmptyFiles,
  formidableErrors.unknownTransferEncoding,
]);

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class ElnImportController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(LocationRepository)
    private locationRepository: LocationRepository,
    @service(ElnImportService) private importService: ElnImportService,
  ) {}

  @post('/logbooks/import/eln', {
    security: OPERATION_SECURITY_SPEC,
    responses: ELN_IMPORT_RESPONSES,
  })
  async import(
    @param.query.string('location-id', {
      description: 'ID of the location to import into',
      required: true,
    })
    locationId: string,
    @requestBody(ELN_IMPORT_REQUEST_BODY)
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<Logbook> {
    const filepath = await this.getUploadedFilePath(request);

    const location = await this.locationRepository.findById(
      locationId,
      {},
      {currentUser: this.user},
    );

    try {
      const logbook = await this.importService.import(filepath, location);
      response.status(201);
      return logbook;
    } catch (err) {
      if (err instanceof ElnImportError) {
        throw new ElnImportHttpError(err.errors);
      }
      throw err;
    }
  }

  private async getUploadedFilePath(request: Request): Promise<string> {
    const form = formidable({maxFileSize: MAX_FILE_SIZE, maxFiles: 1});

    let files;
    try {
      [, files] = await form.parse(request);
    } catch (err: unknown) {
      if (!(err instanceof formidableErrors.default)) throw err;

      if (
        err.code === formidableErrors.biggerThanMaxFileSize ||
        err.code === formidableErrors.biggerThanTotalMaxFileSize
      ) {
        throw new HttpErrors.PayloadTooLarge(err.message);
      }
      if (FORMIDABLE_422_ERRORS.has(err.code)) {
        throw new HttpErrors.UnprocessableEntity(err.message);
      }

      throw err;
    }

    const uploaded = files.file?.[0];
    if (!uploaded) {
      throw new HttpErrors.UnprocessableEntity('A file must be provided');
    }

    return uploaded.filepath;
  }
}
