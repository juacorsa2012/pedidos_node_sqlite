import { app } from "./app.js"
import { env } from "./config/env.js"
import { logger } from "./config/logger.js"
import { prisma } from "./lib/prisma.js"

const SHUTDOWN_TIMEOUT_MS = 10_000

export const server = app.listen(env.PORT, () => {
  logger.info(`Servidor ejecutándose en http://localhost:${env.PORT}`)
})

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`El puerto ${env.PORT} ya está en uso`)
  } else {
    logger.error({ err }, "Error del servidor HTTP")
  }

  process.exitCode = 1
  void shutdown("Error del servidor")
})

let shuttingDown = false

async function shutdown(reason: string, exitCode = 0): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true
  process.exitCode = exitCode

  logger.info(`${reason}: cerrando servidor...`)

  const forceCloseTimer = setTimeout(() => {
    logger.error("Se agotó el tiempo de cierre; cerrando conexiones activas")
    server.closeAllConnections()
  }, SHUTDOWN_TIMEOUT_MS)

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err: NodeJS.ErrnoException | undefined) => {
        if (err?.code === "ERR_SERVER_NOT_RUNNING") {
          resolve()
          return
        }
        if (err) reject(err)
        else resolve()
      })
      // Detiene solicitudes nuevas y no espera a conexiones keep-alive inactivas.
      server.closeIdleConnections()
    })

  } catch (err) {
    process.exitCode = 1
    logger.error({ err }, "Error al cerrar el servidor HTTP")
  } finally {
    clearTimeout(forceCloseTimer)
  }

  try {
    await prisma.$disconnect()
    logger.info("Conexión a la base de datos cerrada")
  } catch (err) {
    process.exitCode = 1
    logger.error({ err }, "Error al desconectar Prisma")
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"))
process.once("SIGTERM", () => void shutdown("SIGTERM"))

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Promesa rechazada sin gestionar")
  void shutdown("Unhandled rejection", 1)
})

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Excepción no capturada")
  void shutdown("Uncaught exception", 1)
})
