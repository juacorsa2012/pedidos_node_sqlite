import * as z from "zod"
import { clienteMessages } from "./clientes.messages.js"

export const createClienteSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, clienteMessages.nombreRequerido)
    .transform((v) => v.toUpperCase())
})

export const updateClienteSchema = createClienteSchema

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive().max(2_147_483_647) // límite de Int en Prisma/PostgreSQL
})

export type CreateClienteInput = z.infer<typeof createClienteSchema>
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>