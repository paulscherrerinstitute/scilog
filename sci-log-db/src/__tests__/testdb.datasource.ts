import {juggler} from '@loopback/repository';

export const testdb: juggler.DataSource = new juggler.DataSource({
  name: 'mongo',
  connector: 'mongodb',
  url: '',
  host: 'mongodb',
  port: 27017,
  user: '',
  password: '',
  database: 'testdb',
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
