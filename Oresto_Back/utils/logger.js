const fs = require('fs')
const pino = require('pino')
const pinoHttp = require('pino-http')

let logger, httpLogger

if (process.env.npm_lifecycle_event === 'test') {
  // En test, log minimal en console
  logger = pino({ level: 'silent' }) // ou 'info' si tu veux voir
  httpLogger = pinoHttp({ logger })
} else {
  const stream = fs.createWriteStream(
    `logs/${new Date().toISOString().replace(/[:]/g, '_')}_${process.env.npm_lifecycle_event === 'test' ? 'TESTING' : 'PRODUCTION'}.log`,
    { flags: 'a' }
  )

  logger = pino({}, stream)
  httpLogger = pinoHttp({ logger })
}

console.log('Logger exports :', { logger, httpLogger })
module.exports.pino = logger
module.exports.http = httpLogger
