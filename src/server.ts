import { app } from "./app.js"
import { env } from "./config/env.js"
import { logger } from "./config/logger.js"
import { prisma } from "./lib/prisma.js"

export const server = app.listen(env.PORT, () => {
  logger.info(`Servidor ejecutandose en http://localhost:${env.PORT}`)
})

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`Puerto ${env.PORT} en uso`)
  } else {
    logger.error({ err }, "Error de servidor")
  }
  process.exit(1)
})

const SHUTDOWN_TIMEOUT_MS = 10_000
let shuttingDown = false

const shutdown = async (motivo: string, exitCode = 0) => {
  if (shuttingDown) return
  shuttingDown = true
  logger.info(`${motivo}: cerrando servidor...`)

  // Si algo impide el cierre, salir igualmente
  const forzar = setTimeout(() => {
    logger.error("Cierre forzado por timeout")
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)
  forzar.unref()

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()))
      server.closeIdleConnections()
    })
    await prisma.$disconnect()
    logger.info("Servidor cerrado")
    process.exit(exitCode)
  } catch (err) {
    logger.error({ err }, "Error durante el cierre")
    process.exit(1)
  }
}

// `once`: un segundo Ctrl+C mata el proceso inmediatamente
process.once("SIGINT", () => void shutdown("SIGINT"))
process.once("SIGTERM", () => void shutdown("SIGTERM"))

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled Rejection")
  void shutdown("unhandledRejection", 1)
})

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught Exception")
  void shutdown("uncaughtException", 1)
})


// npm run db:migrate -- --name crear_clientes