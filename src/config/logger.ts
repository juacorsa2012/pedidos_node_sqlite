import { pino } from "pino"
import { env } from "./env"

export const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime, // Formato legible: "time":"2023-10-02T12:00:00.000Z"
  base: undefined, // Evita que salga el hostname y pid en cada log (útil para Docker)
  level: env.NODE_ENV === "development" ? "debug" : "info", // Controla la verbosidad según el entorno
  transport: env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard", // Hace que pino-pretty muestre la hora local bonita
      ignore: "pid,hostname" // Limpia aún más la salida en consola
    }
  } : undefined,
})