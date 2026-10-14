import * as z from "zod"
import { env } from "../../config/env.js"
import { clienteMessages } from "./clientes.messages.js"

export const createClienteSchema = z.object({
  nombre: z
    .string({
      error: clienteMessages.nombreRequerido,
    })
    .trim()
    .min(1, clienteMessages.nombreRequerido)
    .transform((v) => v.toUpperCase()),
})

export const updateClienteSchema = createClienteSchema

export const listClientesQuerySchema = z.object({
  page: z.coerce.number().int().positive(),
  pageSize: z.coerce.number().int().positive().max(env.PAGE_SIZE_MAX),
})

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive().max(2_147_483_647) // límite de Int en Prisma/PostgreSQL
})

export type CreateClienteInput = z.infer<typeof createClienteSchema>
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>
