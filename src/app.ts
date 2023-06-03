import fastify from 'fastify'
import autoload from '@fastify/autoload'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import path from 'path'
import { errorSchema } from './schemas/error'

interface buildOpts extends FastifyServerOptions {
  exposeDocs?: boolean
}

import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify'

interface IQueryString {
  name: string
}

interface IParams {
  name: string
}

interface CustomRouteGenericParam {
  Params: IParams
}

interface CustomRouteGenericQuery {
  Querystring: IQueryString
}

export default async function (
  instance: FastifyInstance,
  opts: FastifyServerOptions,
  done: () => void
) {
  instance.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    try {
      let newBody
      switch (req.routerPath) {
        case '/webhooks':
          newBody = { raw: body }
          break
        default:
          newBody = JSON.parse(body.toString())
          break
      }
      done(null, newBody)
    } catch (error) {
      error.statusCode = 400
      done(error, undefined)
    }
  })

  instance.addSchema(errorSchema)

  instance.get('/', async (req: FastifyRequest, res: FastifyReply) => {
    res.status(200).send({
      hello: 'World',
    })
  })

  instance.register(autoload, {
    dir: path.join(__dirname, 'routes'),
  })

  done()
}

export async function createServer(opts: buildOpts = {}): Promise<FastifyInstance> {
  const app = fastify(opts)

  /**
   * Expose swagger docs
   */
  if (opts.exposeDocs) {
    await app.register(fastifySwagger, {
      mode: 'dynamic',
      swagger: {
        info: {
          title: 'Stripe Sync Engine',
          version: '0.0.1',
        },
      },
    })

    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    })
  }

  /**
   * Add a content parser for stripe webhooks
   */
  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    try {
      let newBody
      switch (req.routerPath) {
        case '/webhooks':
          newBody = { raw: body }
          break
        default:
          newBody = JSON.parse(body.toString())
          break
      }
      done(null, newBody)
    } catch (error) {
      error.statusCode = 400
      done(error, undefined)
    }
  })

  /**
   * Add common schemas
   */
  app.addSchema(errorSchema)

  /**
   * Expose all routes in './routes'
   */
  await app.register(autoload, {
    dir: path.join(__dirname, 'routes'),
  })

  await app.ready()

  return app
}
