import dotenv from "dotenv"
import { z } from "zod"

dotenv.config({ path: ".env" })

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3000), 
  DATABASE_URL: z.string().min(1)
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error("Error en las variables de entorno:")
  console.error(parsedEnv.error)
  process.exit(1)
}

export const env = parsedEnv.data