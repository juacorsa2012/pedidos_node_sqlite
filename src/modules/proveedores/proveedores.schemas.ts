import * as z from "zod"
import { proveedorMessages } from "./proveedores.messages"

export const createProveedorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, proveedorMessages.nombreRequerido)
    .transform((v) => v.toUpperCase())
})

export const updateProveedorSchema = createProveedorSchema

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive().max(2_147_483_647) 
})

export type CreateProveedorInput = z.infer<typeof createProveedorSchema>
export type UpdateProveedorInput = z.infer<typeof updateProveedorSchema>