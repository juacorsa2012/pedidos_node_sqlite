import dotenv from "dotenv"
import { z } from "zod"
import { commonMessages as Message } from "../common/messages.js"

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env"

dotenv.config({ path: envFile })

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).optional(),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
  PAGE_SIZE_MAX: z.coerce.number().int().positive().default(100),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(43, Message.jwtSecretCorto),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  throw new Error(`Error en las variables de entorno:\n${parsedEnv.error.message}`)
}

export const env = parsedEnv.data
