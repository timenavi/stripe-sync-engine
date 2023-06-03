import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify'
import path from 'path'
import autoload from '@fastify/autoload'
import { errorSchema } from '../schemas/error'

export default async function (
  instance: FastifyInstance,
  opts: FastifyServerOptions,
  done: () => void
) {
  instance.get('/', async (req: FastifyRequest, res: FastifyReply) => {
    res.status(200).send({
      hello: 'World',
    })
  })

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

  instance.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    prefix: '/api',
  })

  done()
}
