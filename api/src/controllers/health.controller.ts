import {performance} from 'node:perf_hooks';
import {setTimeout as sleep} from 'node:timers/promises';
import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {get, Response, RestBindings, SchemaObject} from '@loopback/rest';
import {PackageInfo, PackageKey} from '../application';

/**
 * Health endpoints in the format of the IETF health check draft:
 * https://datatracker.ietf.org/doc/draft-inadarei-api-health-check/
 */

type HealthStatus = 'pass' | 'fail';

interface HealthCheck {
  componentType: string;
  status: HealthStatus;
  observedValue?: number;
  observedUnit?: string;
  time: string;
}

interface HealthResponse {
  status: HealthStatus;
  releaseId: string;
  checks?: Record<string, HealthCheck[]>;
}

const HEALTH_CONTENT_TYPE = 'application/health+json';

// How long MongoDB may take to answer before the api counts as not ready.
// Without it, a ping can hang for the driver's server selection timeout
// (30 s by default).
const PING_TIMEOUT_MS = 2000;

const HEALTH_SCHEMA: SchemaObject = {
  type: 'object',
  required: ['status'],
  properties: {
    status: {type: 'string', enum: ['pass', 'fail']},
    releaseId: {type: 'string'},
    checks: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            componentType: {type: 'string'},
            status: {type: 'string', enum: ['pass', 'fail']},
            observedValue: {type: 'number'},
            observedUnit: {type: 'string'},
            time: {type: 'string', format: 'date-time'},
          },
        },
      },
    },
  },
};

function healthResponse(description: string) {
  return {
    description,
    content: {[HEALTH_CONTENT_TYPE]: {schema: HEALTH_SCHEMA}},
  };
}

export class HealthController {
  constructor(
    @inject('datasources.mongo') private dataSource: juggler.DataSource,
    @inject(PackageKey) private pkg: PackageInfo,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {}

  @get('/health/live', {
    responses: {
      '200': healthResponse('The api process is running'),
    },
  })
  live(): Response {
    return this.send({status: 'pass', releaseId: this.pkg.version});
  }

  @get('/health', {
    responses: {
      '200': healthResponse('The api can serve requests'),
      '503': healthResponse('The database is unreachable'),
    },
  })
  async ready(): Promise<Response> {
    const mongo = await this.checkMongo();
    return this.send({
      status: mongo.status,
      releaseId: this.pkg.version,
      checks: {'mongodb:responseTime': [mongo]},
    });
  }

  private async checkMongo(): Promise<HealthCheck> {
    const start = performance.now();
    // Whichever comes first: MongoDB's answer or the timeout. Both resolve
    // to an error message, or undefined when MongoDB answered in time.
    const error = await Promise.race([
      this.dataSource.ping().then(
        () => undefined,
        err => String(err),
      ),
      sleep(PING_TIMEOUT_MS, `no answer within ${PING_TIMEOUT_MS} ms`, {
        ref: false,
      }),
    ]);
    const time = new Date().toISOString();

    if (error !== undefined) {
      console.warn(`Health check: MongoDB ping failed (${error})`);
      return {componentType: 'datastore', status: 'fail', time};
    }
    return {
      componentType: 'datastore',
      status: 'pass',
      observedValue: Math.round(performance.now() - start),
      observedUnit: 'ms',
      time,
    };
  }

  // Written directly, because LoopBack would replace the content type
  // with application/json.
  private send(body: HealthResponse): Response {
    return (
      this.response
        .status(body.status === 'pass' ? 200 : 503)
        .type(HEALTH_CONTENT_TYPE)
        // Probes need the current state, not a cached one.
        .set('Cache-Control', 'no-cache')
        .json(body)
    );
  }
}
