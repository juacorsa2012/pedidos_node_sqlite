import dotenv from "dotenv"
import { z } from "zod"

const envFile = process.env.NODE_ENV === "test"
  ? ".env.test"
  : ".env"

dotenv.config({ path: envFile })

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  PAGE_SIZE_MAX: z.coerce.number().int().positive().default(100),
  DATABASE_URL: z.string().min(1)
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  throw new Error(`Error en las variables de entorno:\n${parsedEnv.error.message}`)
}

export const env = parsedEnv.data
