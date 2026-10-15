import * as z from "zod"
import { authMessages as Message } from "./auth.messages.js"

const passwordMaxBytes = 72
const passwordWithinByteLimit = (password: string) =>
  new TextEncoder().encode(password).length <= passwordMaxBytes

export const registerSchema = z.object({
  nombre: z.string().trim().min(1, Message.nombreRequerido),
  email: z.string().trim().toLowerCase().pipe(z.email(Message.emailIncorrecto)),
  password: z
    .string()
    .min(8, Message.passwordCorto)
    .refine(passwordWithinByteLimit, Message.passwordLargo),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email(Message.emailIncorrecto)),
  password: z
    .string()
    .min(1, Message.passwordRequerido)
    .refine(passwordWithinByteLimit, Message.passwordLargo),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
