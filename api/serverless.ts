'use strict'

// Read the .env file.
import * as dotenv from 'dotenv'
dotenv.config()

// Require the framework
import Fastify, { FastifyInstance } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { createServer } from '../src/app'
import pino from 'pino'

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
})

const logger = pino({
  formatters: {
    level(label) {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

export default async (req: Request, res: Response) => {
  const customApp: FastifyInstance<Server, IncomingMessage, ServerResponse> = await createServer({
    logger,
    exposeDocs: process.env.NODE_ENV !== 'production',
    requestIdHeader: 'Request-Id',
  })

  // Register your application as a normal plugin.
  // @ts-expect-error - import thing
  app.register(customApp)
  await app.ready()
  app.server.emit('request', req, res)
}
