// Docker HEALTHCHECK for the production image: exits 0 only when the api
// answers on its liveness endpoint.
import {get} from 'node:http';

const port = process.env.PORT ?? 3000;
const basePath = process.env.BASE_PATH ?? '';

get(`http://localhost:${port}${basePath}/health/live`, res =>
  process.exit(res.statusCode === 200 ? 0 : 1),
).on('error', () => process.exit(1));
