import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {del, param} from '@loopback/rest';
import {EditRepository} from '../repositories/edit.repository';
import {basicAuthorization} from '../services/basic.authorizor';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';

@authenticate('jwt')
@authorize({
  allowedRoles: ['any-authenticated-user'],
  voters: [basicAuthorization],
})
export class EditController {
  constructor(
    @inject(SecurityBindings.USER) private user: UserProfile,
    @repository(EditRepository)
    public editRepository: EditRepository,
  ) {}

  @del('/edits/paragraphs-to-delete/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Edits of paragraph DELETE success',
      },
    },
  })
  async deleteToDelete(@param.path.string('id') id: string): Promise<void> {
    await this.editRepository.deleteAll(
      {parentId: id},
      {currentUser: this.user},
    );
  }
}
