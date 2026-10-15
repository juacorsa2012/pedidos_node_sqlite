import { pino } from "pino"
import { env } from "./env.js"

const defaultLogLevel = env.NODE_ENV === "development"
  ? "debug"
  : env.NODE_ENV === "test"
    ? "silent"
    : "info"

export const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  base: undefined,
  level: env.LOG_LEVEL ?? defaultLogLevel,
  transport: env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
    }
  } : undefined,
})
