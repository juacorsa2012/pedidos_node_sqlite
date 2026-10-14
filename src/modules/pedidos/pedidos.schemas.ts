import * as z from "zod"
import { env } from "../../config/env.js"
import { pedidoMessages } from "./pedidos.messages.js"

const prismaIntMax = 2_147_483_647

export const createPedidoSchema = z.object({
  unidades: z.coerce
    .number()
    .int(pedidoMessages.unidadesRequeridas)
    .positive(pedidoMessages.unidadesRequeridas)
    .max(prismaIntMax, pedidoMessages.unidadesRequeridas),
  producto: z
    .string()
    .trim()
    .min(1, pedidoMessages.productoRequerido),
  oferta: z.string().trim().nullable().optional(),
  solicitadoPor: z.string().trim().nullable().optional(),
  observaciones: z.string().trim().nullable().optional(),
  proveedorId: z.coerce
    .number()
    .int(pedidoMessages.proveedorIdRequerido)
    .positive(pedidoMessages.proveedorIdRequerido)
    .max(prismaIntMax, pedidoMessages.proveedorIdRequerido),
  clienteId: z.coerce
    .number()
    .int(pedidoMessages.clienteIdRequerido)
    .positive(pedidoMessages.clienteIdRequerido)
    .max(prismaIntMax, pedidoMessages.clienteIdRequerido),
})

export const updatePedidoSchema = createPedidoSchema

export const listPedidosQuerySchema = z.object({
  page: z.coerce.number().int().positive(),
  pageSize: z.coerce.number().int().positive().max(env.PAGE_SIZE_MAX),
  clienteId: z.coerce
    .number()
    .int(pedidoMessages.clienteIdRequerido)
    .positive(pedidoMessages.clienteIdRequerido)
    .max(prismaIntMax, pedidoMessages.clienteIdRequerido)
    .optional(),
  proveedorId: z.coerce
    .number()
    .int(pedidoMessages.proveedorIdRequerido)
    .positive(pedidoMessages.proveedorIdRequerido)
    .max(prismaIntMax, pedidoMessages.proveedorIdRequerido)
    .optional(),
})

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive().max(prismaIntMax),
})

export type CreatePedidoInput = z.infer<typeof createPedidoSchema>
export type UpdatePedidoInput = z.infer<typeof updatePedidoSchema>
export type ListPedidosQuery = z.infer<typeof listPedidosQuerySchema>
