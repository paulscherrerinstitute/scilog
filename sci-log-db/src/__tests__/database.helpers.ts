import {Options} from '@loopback/repository';
import {Logbook} from '../models';
import {LogbookRepository} from '../repositories';
import {SciLogDbApplication} from '../application';

export class DatabaseHelper {
  constructor(private app: SciLogDbApplication) {}

  async givenLogbook(
    data: Partial<Logbook>,
    options?: Options,
  ): Promise<Logbook> {
    const logbookRepository = await this.app.getRepository(LogbookRepository);
    return logbookRepository.create(data, options);
  }
}
