'use strict'

// Read the .env file.
import * as dotenv from 'dotenv'
dotenv.config()

// Require the framework
import Fastify from 'fastify'

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
})

// Register your application as a normal plugin.
// @ts-expect-error - import thing
app.register(import('../src/app'))

export default async (req: Request, res: Response) => {
  await app.ready()
  app.server.emit('request', req, res)
}